import Profiles from './profiles';
import Discussions from './discussions';
import Votes from './votes';
import Process from '../highlight/process';
import ProfilesAbi from './abis/profiles.json';
import DiscussionsAbi from './abis/discussions.json';

export const AGENTS_MAP = {
  '0x0000000000000000000000000000000000000001': (process: Process) => {
    return new Profiles('profiles', process, ProfilesAbi);
  },
  '0x0000000000000000000000000000000000000002': (process: Process) => {
    return new Discussions('discussions', process, DiscussionsAbi);
  },
  '0x0000000000000000000000000000000000000003': (process: Process) => {
    return new Votes('votes', process, []);
  }
};
