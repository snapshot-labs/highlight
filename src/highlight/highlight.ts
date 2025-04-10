import AsyncLock from 'async-lock';
import { Adapter } from './adapter/adapter';
import Agent from './agent';
import Process from './process';
import { Event, GetUnitReceiptRequest, PostJointRequest, Unit } from './types';

type AgentGetter = (process: Process) => Agent;

export default class Highlight {
  private adapter: Adapter;
  private asyncLock = new AsyncLock();
  public agents: Record<string, AgentGetter>;

  constructor({
    adapter,
    agents
  }: {
    adapter: Adapter;
    agents: Record<string, AgentGetter>;
  }) {
    this.adapter = adapter;
    this.agents = agents;
  }

  postJoint(params: PostJointRequest) {
    return this.asyncLock.acquire('postJoint', () => this._postJoint(params));
  }

  async _postJoint(params: PostJointRequest) {
    let steps = 0;

    const process = new Process({ adapter: this.adapter });
    await this.invoke(process, params.unit.toAddress, params.unit.data);

    const execution = await process.execute();
    steps = process.steps;

    let id: number = (await this.adapter.get('units:id')) || 0;

    const unit: Unit = {
      id,
      ...params.unit
    };

    id++;
    const multi = this.adapter.multi();
    multi.set(`unit:${id}`, unit);
    multi.set(`unit_events:${id}`, execution.events);
    multi.set('units:id', id);

    await multi.exec();

    return {
      joint: { unit },
      events: execution.events || [],
      unit_id: id,
      steps
    };
  }

  async invoke(process: Process, to: string, data: string) {
    const getAgent = this.agents[to.toLowerCase()];
    const agent = getAgent(process);

    return agent.invoke(data);
  }

  async getUnitReceipt(params: GetUnitReceiptRequest) {
    const [unit, events]: [Unit | undefined, Event[] | undefined] =
      await Promise.all([
        this.adapter.get(`unit:${params.id}`),
        this.adapter.get(`unit_events:${params.id}`)
      ]);

    if (!unit) {
      throw new Error(`Unit ${params.id} not found`);
    }

    return {
      unit,
      events: events?.filter(event => event !== null) ?? []
    };
  }

  async getMci() {
    return await this.adapter.get('units:id');
  }

  async reset() {
    return await this.adapter.reset();
  }
}
