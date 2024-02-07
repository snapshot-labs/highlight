import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

export async function getVotingPower(
  _space: string,
  _proposalId: number,
  voter: string,
  chainId: number
): Promise<string> {
  const address = '0xFA60565Aa8Ce3dA049fE1B0b93640534eae84287'; // @TODO find correct contract address from space
  // const blockNum = 5238678; // @TODO find correct proposal snapshot block number
  const abi = [
    'function getVotes(address) view returns (uint256)',
    'function getPastVotes(address,uint256) view returns (uint256)'
  ];
  const provider = new StaticJsonRpcProvider(`https://rpc.brovider.xyz/${chainId}`, chainId);
  const contract = new Contract(address, abi, provider);

  const vp = await contract.getVotes(voter);

  return vp.toString();
}
