import Agent from '../highlight/agent';

export default class VoteRegistry extends Agent {
  async vote(
    space: string,
    voter: string,
    proposalId: number,
    choice: number,
    chainId: number,
    sig: string
  ) {
    // @TODO signature verification

    const event = [space, voter, proposalId, choice, chainId, sig];
    this.event.emit('sx_new_vote', event);
  }
}
