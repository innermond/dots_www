import { splitProps } from 'solid-js';
import { api, apix, query } from '@/lib/api';
import type { ApiArgs, Slice } from '@/lib/api';
import {
  DataEntryTypes,
  DataEntryTypeUnits,
  EntryTypeData,
  isDataEntryTypes,
  isDataEntryTypeUnits,
  isEntryTypeData,
  isKeyofEntryTypeData,
  entryTypeZero,
} from '@/pages/entry-types/types';

class APIEntryType {
  async all(slice: Slice<EntryTypeData>): Promise<DataEntryTypes | Error> {
    const pp = {} as any;
    if (!isNaN(Number(slice?.offset))) {
      pp.offset = slice!.offset;
    }
    if (!isNaN(Number(slice?.limit))) {
      pp.limit = slice!.limit;
    }

    let params = { ...pp };
    const filterKeys = Object.keys(entryTypeZero) as Array<keyof EntryTypeData>;
    const [filters] = splitProps(slice, filterKeys);
    if (!!filters) {
      const fpp = {} as Partial<{
        [K in keyof EntryTypeData]: Function | string;
      }>;
      for (let k of Object.keys(filters)) {
        if (!isKeyofEntryTypeData(k)) {
          continue;
        }
        const fn = filters[k as keyof typeof filters] as Function | string;
        if (typeof fn === 'function') {
          fpp[k] = fn();
        } else {
          fpp[k] = fn;
        }
      }
      params = [
        params,
        fpp,
        { code: 'piese' },
        { code: 'start' },
        { _mask_code: 'ovk' },
      ];
    }
    const url = query('/entry-types', params);
    const args = {
      hint: 'loading entry types',
      method: 'GET',
      url,
      isFn: isDataEntryTypes,
    } as ApiArgs<DataEntryTypes>;

    return api(args);
  }

  async units(): Promise<DataEntryTypeUnits | Error> {
    const args = {
      hint: 'loading entry type units',
      method: 'GET',
      url: '/entry-types?units',
      isFn: isDataEntryTypeUnits,
    } as ApiArgs<DataEntryTypeUnits>;

    return api(args);
  }

  async stats(id: number): Promise<Record<string, string> | Error> {
    const args = {
      hint: 'loading entry type stats',
      method: 'GET',
      url: `/entry-types?stats&id=${id}&kind=default`,
      isFn: (_: Record<string, string>) => true,
    } as ApiArgs<Record<string, string>>;

    return api(args);
  }

  add(data: Omit<EntryTypeData, 'id'>): ReturnType<typeof api<typeof data>> {
    const args = {
      hint: 'adding entry type',
      method: 'POST',
      url: '/entry-types',
      isFn: isEntryTypeData,
      data,
    } as ApiArgs<typeof data>;

    return api<typeof data>(args);
  }

  addx(data: Omit<EntryTypeData, 'id'>): ReturnType<typeof apix<typeof data>> {
    const args = {
      hint: 'adding entry type',
      method: 'POST',
      url: '/entry-types',
      isFn: isEntryTypeData,
      data,
    } as ApiArgs<typeof data>;

    return apix<typeof data>(args);
  }

  editx(data: EntryTypeData): ReturnType<typeof apix<typeof data>> {
    const { id, ...idless } = data;
    const args = {
      hint: 'editing entry type',
      method: 'PATCH',
      url: `/entry-types/${id}`,
      isFn: isEntryTypeData,
      data: idless,
    } as ApiArgs<typeof data>;

    return apix<typeof data>(args);
  }

  edit(data: EntryTypeData): ReturnType<typeof api<typeof data>> {
    const { id, ...idless } = data;
    const args = {
      hint: 'editing entry type',
      method: 'PATCH',
      url: `/entry-types/${id}`,
      isFn: isEntryTypeData,
      data: idless,
    } as ApiArgs<typeof data>;

    return api<typeof data>(args);
  }

  del(data: EntryTypeData): ReturnType<typeof apix<typeof data>> {
    const { id } = data;
    const args = {
      hint: 'soft deleting entry type',
      method: 'PATCH',
      url: `/entry-types/${id}?del`,
      isFn: (v: any) => 'n' in v && !isNaN(parseInt(v.n)),
    } as ApiArgs<never>;

    return apix<never>(args);
  }

  delete(data: EntryTypeData): ReturnType<typeof apix<typeof data>> {
    const { id } = data;
    const args = {
      hint: 'deleting entry type',
      method: 'DELETE',
      url: `/entry-types/${id}`,
      isFn: (v: any) => 'n' in v && !isNaN(parseInt(v.n)),
    } as ApiArgs<never>;

    return apix<never>(args);
  }
}

const apiEntryType = new APIEntryType();
Object.freeze(apiEntryType);

export default apiEntryType;
