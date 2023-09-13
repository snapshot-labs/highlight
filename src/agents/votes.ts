import Agent from '../highlight/agent';

export default class Votes extends Agent {
  async vote(
    space: string,
    voter: string,
    proposalId: number,
    choice: number,
    chainId: number,
    sig: string
  ) {
    // @TODO signature and storage proof verification

    this.emit('vote', [space, voter, proposalId, choice, chainId, sig]);
  }
}
