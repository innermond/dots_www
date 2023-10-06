const API = 'http://api.dots.volt.com/v1';

async function send<T>(
  method: string,
  url: string,
  data: T,
  extraHeaders?: {[key: string]: string}, 
): Promise<JSON | Error> {
  const headers: HeadersInit = { 'Content-type': 'application/json', ...extraHeaders };
  const opts: RequestInit = { method, headers };

  opts.mode = 'cors';
  opts.redirect = 'follow';

  if (data !== undefined) {
    opts.body = JSON.stringify(data);
  }

  try {
    const response: Response = await fetch(API + url, opts);
    if (!response.ok) {
      const json = await response.json();
      return Promise.reject(json);
    }
    return response.json();
  } catch (err) {
    return Promise.reject(err);
  }
}

type LoginParams = {
  usr: string;
  pwd: string;
};

export function login(data: LoginParams): Promise<JSON | Error> {
  return send<LoginParams>('POST', '/login', data);
}

const key = 'dots.tok';
export const company = {
  all: async function (run: boolean): Promise<JSON | Error> {
    console.log('run', run)
    const headers = {'Authorization': 'Bearer ' + sessionStorage.getItem(key) ?? ''};
    try {
      const out = await send<undefined>('GET', '/companies', undefined, headers);
      return Promise.resolve(out);
    } catch (err) {
      return err as Error;
    }
    //return send<undefined>('GET', '/companies', undefined, headers);
  }
}
