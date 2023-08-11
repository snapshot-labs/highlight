import Agent from '../highlight/agent';

export default class Discussions extends Agent {
  async add_category(parent: number, metadataURI: string) {
    const id = (await this.storage.read('next_category_id')) as number;

    const event = [id, parent, metadataURI];

    this.storage.write(`category.${id}`, 'bool', '1');
    this.storage.write('next_category_id', 'number', (id + 1).toString());

    this.event.emit('new_category', event);

    return event;
  }

  async discuss(author: string, category: number, parent: number, metadataURI: string) {
    if (!author) return Promise.reject('invalid author');

    if (!(await this.storage.has(`category.${category}`)))
      return Promise.reject('invalid category');

    const id = (await this.storage.read('next_discussion_id')) as number;

    const event = [id, author, category, parent, metadataURI];

    this.storage.write(`discussion.${id}`, 'bool', '1');
    this.storage.write('next_discussion_id', 'number', (id + 1).toString());

    this.event.emit('new_discussion', event);

    return event;
  }

  async pin(discussion: number, category: number) {
    if (!(await this.storage.has(`discussion.${discussion}`)))
      return Promise.reject('invalid discussion');

    const event = [discussion, category];

    this.storage.write(`category.${category}.pin`, 'number', discussion.toString());

    this.event.emit('pin', event);
  }

  async vote(voter: string, discussion: number, choice: number) {
    if (!voter) return Promise.reject('invalid voter');

    if (!(await this.storage.has(`discussion.${discussion}`)))
      return Promise.reject('invalid discussion');

    const event = [voter, discussion, choice];

    this.event.emit('new_vote', event);

    return event;
  }
}
