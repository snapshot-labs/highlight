import Agent from '../highlight/agent';

export default class Authentications extends Agent {
  async add_alias(alias: string, target: string) {
    console.log('add_alias', alias, target);

    this.assert(await this.has(`alias.${alias}`), 'invalid alias');
    this.assert(target !== this.process.sender, 'unauthorized');

    this.write(`alias.${alias}`, target);

    this.emit('add_alias', [alias, target]);
  }

  async authenticate(alias: string, target: string): Promise<boolean> {
    console.log('is_authorized', alias, target);

    return alias === target || target === (await this.get(`alias.${alias}`));
  }
}
