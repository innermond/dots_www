import {Md5} from 'ts-md5';

const prefix = 'dots.tok';

let sessionKey = '';

export function getSessionKey(): string {
  return sessionKey;
}

export function setSessionKey(str: string): void {
  const v = prefix + Md5.hashStr(str);
  sessionKey = v;
}
