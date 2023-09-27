import Agent from '../highlight/agent';

export default class Profiles extends Agent {
  async set_profile(user: string, metadataURI: string) {
    this.emit('set_profile', [user, metadataURI]);
  }

  async set_statement(user: string, org: string, metadataURI: string) {
    this.emit('set_statement', [user, org, metadataURI]);
  }
}
