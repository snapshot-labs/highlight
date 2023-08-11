import fs from 'fs';
import Agent from './agent';
import db from './helpers/mysql';
import Process from './process';
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

        await process.execute();

        return 'OK';
      } catch (e) {
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
    const query = 'SELECT * FROM events WHERE `id` >= ? AND `id` <= ?';

    const result = await db.queryAsync(query, [params.start, params.end]);

    return result.map(event => ({
      ...event,
      events: JSON.parse(event.events)
    }));
  }

  async reset() {
    let query = 'DROP TABLE IF EXISTS agents, units, storages, events;';
    query += fs.readFileSync('./src/highlight/helpers/schema.sql').toString();

    return await db.queryAsync(query);
  }
}
