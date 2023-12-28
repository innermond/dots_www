import {EntryTypeData} from "@/pages/entry-types/types";

const API = 'http://api.dots.volt.com/v1';

class ApiError extends Error {
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
  data?: T,
  extraHeaders?: { [key: string]: string },
  signal?: AbortSignal,
): Promise<JSON | Error> {
  const headers: HeadersInit = {
    'X-Request-Id': crypto.randomUUID(),
    'Content-type': 'application/json',
    ...extraHeaders,
  };
  const opts: RequestInit = { method, headers, signal };

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
    if (response.status >= 400) {
      const message = json?.error ?? 'we got error';
      const data = json?.data;
      const httperr = new ApiError(`${hint}: ${message}`, response, data);
      throw httperr;
    }
    return json;
  } catch (err: any) {
    // TODO find a proper way to deal with AbortError
    if (err?.name === 'AbortError') {
      console.log(err.message);
      return err;
    }
    throw err;
  }
}

type IsFn<T> = (json: unknown) => json is T;
type ApiArgs<T> = {
  data?: T;
  isFn: IsFn<T>;
  hint: string;
  method: 'POST' | 'GET' | 'OPTIONS' | 'PATCH' | 'DELETE';
  url: string;
  extraHeaders?: { [key: string]: string };
  signal?: AbortSignal;
};

const api = async <T>(args: ApiArgs<T>): Promise<T | Error> => {
  const { hint, method, url, data, extraHeaders, isFn, signal } = args;

  let headers = {
    Authorization: 'Bearer ' + sessionStorage.getItem(key) ?? '',
  };
  if (extraHeaders) {
    headers = { ...headers, ...extraHeaders };
  }

  const json = await send<T>(hint, method, url, data, headers, signal);

  const verifiedOrError = verifiedJSONorError<T>(isFn, json);

  if (verifiedOrError instanceof Error) {
    return verifiedOrError;
  }
  return convertKeysToCamelCase(verifiedOrError) as T;
};

type SliceFilter<T> = (
| {
  [Key in keyof T extends infer K ? `_mask_${string & K}` : never]: string;
} 
|  {[K in keyof T]: T[K] | string})[];

type Slice<T> = { offset: number; limit: number, filter: SliceFilter<Partial<T>>};

type URLParams = Record<string, string>;

const query = (path: string, pairs: URLParams | URLParams[]) => {
  const q = new URLSearchParams();
  let mpairs: URLParams[] = [];
  if (!Array.isArray(pairs)) {
    mpairs = [pairs];
  } else {
    mpairs = pairs;
  }
  for (const pairs of mpairs) {
    for (const [k, v] of Object.entries(pairs)) {
      q.append(k, v);
    }
  }
  const qstr = q.toString();
  const url = path + (qstr ? '?' + qstr : '');

  return url;
};

function apix<T>(args: ApiArgs<T>): [ReturnType<typeof api<T>>, Function] {
  const controller = new AbortController();
  const signal = controller.signal;

  const promise = api({ ...args, signal });
  const abort = () => controller.abort();

  return [promise, abort];
}

type LoginParams = {
  usr: string;
  pwd: string;
};

export function login(data: LoginParams): Promise<JSON | Error> {
  return send<LoginParams>('checking credentials', 'POST', '/login', data);
}

const key = 'dots.tok';

function verifiedJSONorError<T>(
  validator: (json: unknown) => json is T,
  json: unknown,
): T | Error {
  if (validator(json)) {
    return json;
  }
  return new Error('unexpected data from server');
}

type CamelCaseKey<S extends string> = S extends `${infer First}_${infer Rest}`
  ? `${First}${Capitalize<CamelCaseKey<Rest>>}`
  : S;

type CamelCase<T> = T extends object
  ? {
      [K in keyof T as CamelCaseKey<string & K>]: CamelCase<T[K]>;
    }
  : T;

function convertKeysToCamelCase(data: unknown): CamelCase<typeof data> {
  if (Array.isArray(data)) {
    return data.map((item: unknown) => convertKeysToCamelCase(item));
  } else if (
    data !== null &&
    typeof data === 'object' &&
    Object.keys(data).length
  ) {
    const camelCaseData = {} as any; // added any to notify typescript compiler that any props can/will be added
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const camelCaseKey = key.replace(/_(\w)/g, (_, match) =>
          match.toUpperCase(),
        );
        camelCaseData[camelCaseKey] = convertKeysToCamelCase(
          (data as any)[key as keyof typeof data],
        );
      }
    }
    return camelCaseData;
  }
  return data;
}

function payload<T>(obj: T, filterList: string[]): Partial<T> {
  const isObject = typeof obj === 'object' && obj !== null;
  if (!isObject) return {};

  const out: Partial<T> = Object.keys(obj).reduce((acc, k) => {
    if (filterList.includes(k) && k in obj) {
      acc[k as keyof T] = obj[k as keyof T];
    }
    return acc;
  }, {} as Partial<T>);

  return out;
}

const zero = (undef: boolean = false) => ({
  value: undef ? null : '',
  error: false,
  message: [],
});

export type { ApiArgs, Slice, };
export { ApiError, api, apix, query, send, payload, zero };
