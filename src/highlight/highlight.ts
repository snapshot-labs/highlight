import Agent from './agent';
import Process from './process';
import type { GetEventsRequest, PostJointRequest, Message } from './types';
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

    if (params.unit.messages.length > 0) {
      const process = new Process({ adapter: this.adapter });

      try {
        for (const message of params.unit.messages) {
          await this.invoke(process, message);
        }

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
    multi.set(`unit:${id}`, params.unit);
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

  async invoke(process: Process, message: Message) {
    const getAgent = this.agents[message.to.toLowerCase()];
    const agent = getAgent(process);

    return agent.invoke(message.data);
  }

  async getEvents(params: GetEventsRequest) {
    const keys = [...Array(params.end - params.start).keys()].map(
      (key, i) => `event:${i + params.start}`
    );
    const events = await this.adapter.mget(keys);

    return events.filter(event => event !== null);
  }

  async getMci() {
    return await this.adapter.get('events:id');
  }

  async reset() {
    return await this.adapter.reset();
  }
}
