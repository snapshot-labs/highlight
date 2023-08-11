import Agent from '../highlight/agent';
import agents from './';

export default class VanillaAuthenticator extends Agent {
  async authenticate(target: string, methodSelector: string, args: any[]) {
    const agent = new agents[target](target, this.process);

    // @TODO signature verification

    return await agent[methodSelector](...args);
  }
}
