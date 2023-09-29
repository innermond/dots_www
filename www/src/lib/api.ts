const API = 'http://api.dots.volt.com/v1';

async function send<T>(
  method: string,
  url: string,
  data: T,
): Promise<JSON | Error> {
  const headers: HeadersInit = { 'Content-type': 'application/json' };
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
