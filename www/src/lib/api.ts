const API = 'http://api.dots.volt.com/v1';

export class ApiError extends Error {
  response: Response;
  data: any;

  constructor(message: string, response: Response, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
    this.data = data;
  }
}

async function send<T>(
  hint: string,
  method: string,
  url: string,
  data: T,
  extraHeaders?: { [key: string]: string },
): Promise<JSON | Error> {
  const headers: HeadersInit = {
    'Content-type': 'application/json',
    ...extraHeaders,
  };
  const opts: RequestInit = { method, headers };

  opts.mode = 'cors';
  opts.redirect = 'follow';

  if (data !== undefined) {
    opts.body = JSON.stringify(data);
  }

  // TODO set server response's status and latency
  const dev = {
    devstatus: (window as any)?.devstatus ?? '',
    devsleep: (window as any)?.devsleep ?? '',
  };
  const qp = new URLSearchParams(dev);
  for (let [k, v] of qp.entries()) {
    if (v === '') {
      qp.delete(k);
    }
  }
  const q = qp.toString();

  try {
    const response: Response = await fetch(API + url + `?${q}`, opts);
    let json = await response.json();
    // TODO use din dev data
    if ((window as any)?.devjson) {
      json = (window as any).devjson;
    }
    if (!response.ok) {
      const message = json?.error ?? 'we got error';
      const data = json?.data;
      const httperr = new ApiError(`${hint}: ${message}`, response, data);
      throw httperr;
    }
    return json;
  } catch (err: any) {
    throw err;
  }
}

type LoginParams = {
  usr: string;
  pwd: string;
};

export function login(data: LoginParams): Promise<JSON | Error> {
  return send<LoginParams>('checking credentials', 'POST', '/login', data);
}

const key = 'dots.tok';
export const company = {
  all: function (run: boolean): Promise<JSON | Error> {
    const headers = {
      Authorization: 'Bearer ' + sessionStorage.getItem(key) ?? '',
    };
    return send<undefined>(
      'loading companies',
      'GET',
      '/companies',
      undefined,
      headers,
    );
  },
};
