import Agent from './agent';
import Process from './process';
import redis from './redis';
import type { InvokeRequest, GetEventsRequest, PostJointRequest } from './types';

export default class Highlight {
  public agents: Record<string, Agent>;

  constructor({ agents }) {
    this.agents = agents;
  }

  async postJoint(params: PostJointRequest) {
    if (params.unit.messages.length > 0) {
      const process = new Process();

      try {
        for (const message of params.unit.messages) {
          if (message.type === 'INVOKE_FUNCTION') {
            await this.invoke(process, message.payload);
          }
        }

        return await process.execute();
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    }
  }

  async invoke(process: Process, params: InvokeRequest) {
    // @ts-ignore
    const agent = new this.agents[params.agent](params.agent, process);

    return await agent[params.method](...params.args);
  }

  async getEvents(params: GetEventsRequest) {
    const keys = [...Array(params.end - params.start).keys()].map(
      (key, i) => `event:${i + params.start}`
    );
    const result = await redis.mGet(keys);

    return result.filter(event => event !== null).map(event => JSON.parse(event as string));
  }

  async reset() {
    return await redis.flushAll();
  }
}
