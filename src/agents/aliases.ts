import Agent from '../highlight/agent';

export default class Aliases extends Agent {
  async setAlias() {
    this.emit('setAlias', []);
  }
}
