import { api, ApiArgs } from '@/lib/api';
import {
  DataEntryTypes,
  DataEntryTypeUnits,
  EntryTypeData,
  isDataEntryTypes,
  isDataEntryTypeUnits,
  isEntryTypeData,
} from '@/pages/entry-types/types';

class APIEntryType {
  async all(): Promise<DataEntryTypes | Error> {
    const args = {
      hint: 'loading entry types',
      method: 'GET',
      url: '/entry-types',
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

  add(data: EntryTypeData): [Promise<EntryTypeData | Error>, Function] {
    const controller = new AbortController();
    const signal = controller.signal;

    const args = {
      hint: 'adding entry type',
      method: 'POST',
      url: '/entry-types',
      isFn: isEntryTypeData,
      data,
      signal,
    } as ApiArgs<EntryTypeData>;

    return [api(args), () => controller.abort()];
  }
}

const apiEntryType = new APIEntryType();
Object.freeze(apiEntryType);

export default apiEntryType;
