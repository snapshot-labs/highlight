import { BigNumberish, ec, hash, selector } from 'starknet';
import Agent from './agent';
import Process from './process';
import type { InvokeRequest, GetEventsRequest, PostJointRequest } from './types';
import type { Adapter } from './adapter/adapter';

const RELAYER_PUBLIC_KEY = process.env.RELAYER_PUBLIC_KEY || '';

export default class Highlight {
  private adapter: Adapter;
  public agents: Record<string, Agent>;

  constructor({ adapter, agents }) {
    this.adapter = adapter;
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
      const process = new Process({ adapter: this.adapter });

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

  async invoke(process: Process, params: InvokeRequest) {
    // @ts-ignore
    const agent = new this.agents[params.agent](params.agent, process);

    return await agent[params.method](...params.args);
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
