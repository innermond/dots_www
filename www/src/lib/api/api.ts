import {
  DataCompanies,
  DataCompanyStats,
  isDataCompanies,
  isDataCompanyStats,
  DataCompanyDepletion,
  isDataCompanyDepletion,
} from '@/pages/company/types';

import {
  DataEntryTypes,
  isDataEntryTypes,
  EntryTypeData,
  isEntryTypeData,
} from '@/pages/entry-types/types';

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

type IsFn<T> = (json: unknown) => json is T;
type ApiArgs<T> = {
  data?: T;
  isFn: IsFn<T>;
  hint: string;
  method: 'POST'|'GET'|'OPTIONS'|'PATCH'|'DELETE';
  url: string;
  extraHeaders?: { [key: string]: string };
}

const api = async <T>(args: ApiArgs<T>): Promise<T | Error> => {
  const {
    hint,
    method,
    url,
    data,
    extraHeaders,
    isFn,
  } = args;

  let headers = {
    Authorization: 'Bearer ' + sessionStorage.getItem(key) ?? '',
  };
  if (extraHeaders) {
    headers = {...headers, ...extraHeaders};
  }

  const json = await send<T>(
    hint,
    method,
    url,
    data,
    headers,
  );

  const verifiedOrError = verifiedJSONorError<T>(isFn, json);

  if (verifiedOrError instanceof Error) {
    return verifiedOrError;
  }
  return convertKeysToCamelCase(verifiedOrError) as T;
}

const query = (path: string, pairs: Record<string, string>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(pairs)) {
    q.append(k, v);
  }
  const qstr = q.toString();
  const url = `${path}?${qstr}`;

  return url;
};

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

export type {ApiArgs};
export {ApiError, api, query, send};