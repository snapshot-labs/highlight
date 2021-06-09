export let logs: string[] = [];

export function log(msg: string) {
  logs.push(msg);
  logs = logs.slice(-24);
  console.log(msg);
}
