import { BigNumberish, ec, hash, selector } from 'starknet';
import Agent from './agent';
import Process from './process';
import redis from './redis';
import type { InvokeRequest, GetEventsRequest, PostJointRequest } from './types';

const RELAYER_PUBLIC_KEY = process.env.RELAYER_PUBLIC_KEY || '';

export default class Highlight {
  public agents: Record<string, Agent>;

  constructor({ agents }) {
    this.agents = agents;
  }

  async postJoint(params: PostJointRequest) {
    const unitRaw: any = structuredClone(params.unit);
    delete unitRaw.unit_hash;
    delete unitRaw.signature;

    const data: BigNumberish[] = [selector.starknetKeccak(JSON.stringify(unitRaw))];
    const unitHash = hash.computeHashOnElements(data);

    const isValidSignature = ec.starkCurve.verify(
      params.unit.signature,
      unitHash,
      RELAYER_PUBLIC_KEY
    );

    if (!isValidSignature) {
      return Promise.reject('wrong signature');
    }

    let execution;
    let steps = 0;

    if (params.unit.messages.length > 0) {
      const process = new Process();

      try {
        for (const message of params.unit.messages) {
          if (message.type === 'INVOKE_FUNCTION') {
            await this.invoke(process, message.payload);
          }
        }

        execution = await process.execute();
        steps = process.steps;
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    }

    let id = parseInt((await redis.get('units:id')) || '0');

    id++;
    const multi = redis.multi();
    multi.set(`unit:${id}`, JSON.stringify(params.unit));
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
