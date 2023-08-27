import Agent from '../highlight/agent';

export default class Profile extends Agent {
  async edit_profile(user: string, metadataURI: string) {
    const event = [user, metadataURI];
    this.event.emit('profile_updated', event);
  }
}
