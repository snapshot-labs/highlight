import type { Response } from 'express';

export function rpcSuccess(res: Response, result: any, id: number | null) {
  return res.json({ jsonrpc: '2.0', result, id });
}

export function rpcError(
  res: Response,
  status: number,
  code: number,
  message: any,
  id: number | null
) {
  return res.status(status).json({
    jsonrpc: '2.0',
    error: { code, message },
    id
  });
}

export async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
