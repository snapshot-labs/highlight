import Agent from './agent';
import Process from './process';
import type { GetEventsRequest, GetUnitReceiptRequest, PostJointRequest } from './types';
import type { Adapter } from './adapter/adapter';

type AgentGetter = (process: Process) => Agent;
export default class Highlight {
  private adapter: Adapter;
  public agents: Record<string, AgentGetter>;

  constructor({ adapter, agents }: { adapter: Adapter; agents: Record<string, AgentGetter> }) {
    this.adapter = adapter;
    this.agents = agents;
  }

  async postJoint(params: PostJointRequest) {
    const unitRaw: any = structuredClone(params.unit);
    delete unitRaw.unit_hash;
    delete unitRaw.signature;

    let execution;
    let steps = 0;

    if (params.unit.txData.to) {
      const process = new Process({ adapter: this.adapter });
      try {
        await this.invoke(process, params.unit.txData.to, params.unit.txData.data);

        execution = await process.execute();
        steps = process.steps;
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    }

    let id = (await this.adapter.get('units:id')) || 0;

    id++;
    const multi = this.adapter.multi();
    multi.incr(`sender_txs_count:${params.unit.sender_address}`);
    multi.set(`unit:${id}`, params.unit);
    multi.set(`unit_events:${id}`, execution.events || []);
    multi.set(`units_map:${params.unit.unit_hash}`, id);
    multi.set('units:id', id);

    await multi.exec();

    return {
      joint: params,
      events: execution.events || [],
      unit_id: id,
      last_event_id: execution.last_event_id,
      steps
    };
  }

  async invoke(process: Process, to: string, data: string) {
    const getAgent = this.agents[to.toLowerCase()];
    const agent = getAgent(process);

    return agent.invoke(data);
  }

  async getEvents(params: GetEventsRequest) {
    const keys = [...Array(params.end - params.start).keys()].map(
      (key, i) => `event:${i + params.start}`
    );
    const events = await this.adapter.mget(keys);

    return events.filter(event => event !== null);
  }

  async getUnitReceipt(params: GetUnitReceiptRequest) {
    const unitId = await this.adapter.get(`units_map:${params.hash}`);
    const events = await this.adapter.get(`unit_events:${unitId}`);

    return {
      events: events.filter(event => event !== null)
    };
  }

  async getMci() {
    return await this.adapter.get('events:id');
  }

  async reset() {
    return await this.adapter.reset();
  }
}
