import Agent from '../highlight/agent';

export default class Authentications extends Agent {
  async add_alias(alias: string) {
    console.log('add_alias', alias);

    const sender = this.process.sender;

    this.write(`alias.${alias}`, true);
    this.write(`owner.alias.${alias}`, sender);

    this.emit('add_alias', [alias, sender]);
  }

  async remove_alias(alias: string) {
    console.log('remove_alias', alias);

    const sender = this.process.sender;

    this.assert(!(await this.has(`alias.${alias}`)), 'invalid alias');
    this.assert((await this.get(`owner.alias.${alias}`)) !== sender, 'no permission');

    this.delete(`alias.${alias}`);
    this.delete(`owner.alias.${alias}`);

    this.emit('remove_alias', [alias, sender]);
  }
}
