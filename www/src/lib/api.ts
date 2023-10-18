import { DataCompanies, isDataCompanies } from '@/pages/company/types';

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
  // use Array.from to make a static copy of qp.entries() in order to delete from qp
  // otherwise, using directly qp.entries() and deleting from qp will "skip" steps
  // as qp.entries() - the iterator - is tied intimately with qp and any deletion from qp
  // alter iteration offered by qp.entries()
  // practically by deleting from qp you shorten the loop while looping
  const qpe = Array.from(qp.entries());
  for (let [k, v] of qpe) {
    if (v === '') {
      qp.delete(k);
    }
  }
  const q = qp.toString();
  let endpoint = API + url;
  if (!!q) {
    endpoint += `?${q}`;
  }

  try {
    const response: Response = await fetch(endpoint, opts);
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

class APICompany {
  @returnCheckedJSONorError(isDataCompanies)
  all(): Promise<JSON | Error> {
    const headers = {
      Authorization: 'Bearer ' + sessionStorage.getItem(key) ?? '',
    };
    const json = send<undefined>(
      'loading companies',
      'GET',
      '/companies',
      undefined,
      headers,
    );

    return json;
  }

  async one (id: string): Promise<DataCompanies | Error> {
    const q = new URLSearchParams();
    q.append('id', id);
    const qstr = q.toString();

    const headers = {
      Authorization: 'Bearer ' + sessionStorage.getItem(key) ?? '',
    };
    const json = await send<undefined>(
      'loading company',
      'GET',
      `/companies?${qstr}`,
      undefined,
      headers,
    );
/*
    if (isDataCompanies(json)) {
      return json;
    }

    return new Error('unexpected data from server');*/
    return verifyJSONorError<DataCompanies>(isDataCompanies, json);
  }
};

export const company = new APICompany();

function verifyJSONorError<T>(validator: Function, json: unknown): T | Error {
    if (validator(json)) {
      return json as T;
    }

    return new Error('unexpected data from server');

} 

function returnCheckedJSONorError<V extends Function>(validator: V) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const fn = target[key];
    if (typeof fn !== 'function') return descriptor;

    descriptor.value = async function() {
      const result = await fn.apply(this, arguments);
      if (validator(result)) return result;
      return new Error('unexpected data from server');
    }

    return descriptor;
  }
}
