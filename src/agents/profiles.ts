import Agent from '../highlight/agent';

export default class Profiles extends Agent {
  async edit_profile(user: string, metadataURI: string) {
    this.emit('edit_profile', [user, metadataURI]);
  }
}
