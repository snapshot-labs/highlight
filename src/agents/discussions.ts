import Agent from '../highlight/agent';
import { AGENTS_MAP as agents } from './index';

export default class Discussions extends Agent {
  async add_category(parent: number, metadataURI: string) {
    console.log('add_category', parent, metadataURI);

    const id = (await this.get('next_category_id')) || 1;

    this.assert(parent !== 0 && !(await this.has(`category.${parent}`)), 'invalid category');

    this.write(`category.${id}`, this.process.sender);
    this.write('next_category_id', id + 1);

    this.emit('add_category', [id, parent, metadataURI]);
  }

  async edit_category(category: number, metadataURI: string) {
    console.log('edit_category', category, metadataURI);

    await this.authenticate(this.process.sender, await this.get(`category.${category}`));

    this.emit('edit_category', [category, metadataURI]);
  }

  async remove_category(category: number) {
    console.log('remove_category', category);

    this.assert(!(await this.has(`category.${category}`)), 'invalid category');
    await this.authenticate(this.process.sender, await this.get(`category.${category}`));

    this.delete(`category.${category}`);

    this.emit('remove_category', [category]);
  }

  async add_topic(author: string, category: number, parent: number, metadataURI: string) {
    console.log('add_topic', author, category, parent, metadataURI);

    this.assert(!author, 'invalid author');
    this.assert(category !== 0 && !(await this.has(`category.${category}`)), 'invalid category');

    const id = (await this.get('next_topic_id')) || 1;

    this.write(`topic.${id}`, this.process.sender);
    this.write('next_topic_id', id + 1);

    this.emit('add_topic', [id, author, category, parent, metadataURI]);
  }

  async edit_topic(topic: number, metadataURI: string) {
    console.log('edit_topic', topic, metadataURI);

    this.assert(!(await this.has(`topic.${topic}`)), 'invalid topic');
    await this.authenticate(this.process.sender, await this.get(`topic.${topic}`));

    this.emit('edit_topic', [topic, metadataURI]);
  }

  async remove_topic(topic: number) {
    console.log('remove_topic', topic);

    this.assert(!(await this.has(`topic.${topic}`)), 'invalid topic');
    await this.authenticate(this.process.sender, await this.get(`topic.${topic}`));

    this.delete(`topic.${topic}`);

    this.emit('remove_topic', [topic]);
  }

  async pin_topic(topic: number) {
    console.log('pin_topic', topic);

    this.assert(!(await this.has(`topic.${topic}`)), 'invalid topic');
    await this.authenticate(this.process.sender, await this.get(`topic.${topic}`));

    this.emit('pin_topic', [topic]);
  }

  async unpin_topic(topic: number) {
    console.log('unpin_topic', topic);

    this.assert(!(await this.has(`topic.${topic}`)), 'invalid topic');
    await this.authenticate(this.process.sender, await this.get(`topic.${topic}`));

    this.emit('unpin_topic', [topic]);
  }

  async vote(voter: string, topic: number, choice: number) {
    console.log('vote', voter, topic, choice);

    this.assert(!voter, 'invalid voter');
    this.assert(!(await this.has(`topic.${topic}`)), 'invalid topic');

    this.write(`vote.${voter}`, this.process.sender);

    this.emit('vote', [voter, topic, choice]);
  }

  async unvote(voter: string, topic: number) {
    console.log('unvote', voter, topic);

    this.assert(!voter, 'invalid voter');
    this.assert(!(await this.has(`topic.${topic}`)), 'invalid topic');
    this.assert((await this.get(`vote.${voter}`)) !== this.process.sender, 'no permission');

    this.emit('unvote', [voter, topic]);
  }

  private async authenticate(wallet: string, target: string) {
    const authAgent = agents['0x0000000000000000000000000000000000000004'](this.process);

    this.assert(await authAgent.authenticate(wallet, target), 'unauthorized');
  }
}
