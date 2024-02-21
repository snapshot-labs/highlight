import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/23545/sx-sepolia/version/latest';

async function getProposal(space: string, proposalId: number) {
  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `{
        proposal(id: "${space}/${proposalId}") {
          snapshot
        }
      }`
    })
  });
  const { data } = await res.json();

  return data?.proposal;
}

export async function getVotingPower(
  space: string,
  proposalId: number,
  voter: string,
  chainId: number
): Promise<string> {
  if (chainId !== 11155111) return '0';

  const proposal = await getProposal(space, proposalId);

  if (!proposal) return '0';

  const address = '0xFA60565Aa8Ce3dA049fE1B0b93640534eae84287'; // @TODO find correct contract address from space
  const blockNum = proposal.snapshot;
  const abi = ['function getPastVotes(address,uint256) view returns (uint256)'];
  const provider = new StaticJsonRpcProvider(`https://rpc.brovider.xyz/${chainId}`, chainId);
  const contract = new Contract(address, abi, provider);

  try {
    const vp = await contract.getPastVotes(voter, blockNum);

    return vp.toString();
  } catch (e) {
    console.log(e);

    return '0';
  }
}
