import Aliases from './aliases';
import Process from '../highlight/process';

export const AGENTS_MAP = {
  '0x0000000000000000000000000000000000000001': (process: Process) => {
    return new Aliases('aliases', process);
  }
};
