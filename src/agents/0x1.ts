import Agent from '../highlight/agent';

export default class Discussions extends Agent {
  async add_category(parent: number, metadataURI: string) {
    console.log('Parent', parent, 'Metadata URI', metadataURI);
    const id = (await this.storage.get('next_category_id')) || 1;

    this.storage.write(`category.${id}`, 1);
    this.storage.write('next_category_id', id + 1);

    const event = [id, parent, metadataURI];
    this.event.emit('new_category', event);

    return event;
  }

  async discuss(author: string, category: number, parent: number, metadataURI: string) {
    if (!author) return Promise.reject('invalid author');

    if (!(await this.storage.has(`category.${category}`)))
      return Promise.reject('invalid category');

    const id = (await this.storage.get('next_discussion_id')) || 1;

    this.storage.write(`discussion.${id}`, true);
    this.storage.write('next_discussion_id', id + 1);

    const event = [id, author, category, parent, metadataURI];
    this.event.emit('new_discussion', event);

    return event;
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
