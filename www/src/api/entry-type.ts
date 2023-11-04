import {api, ApiArgs} from "@/lib/api";
import {DataEntryTypes, EntryTypeData, isDataEntryTypes, isEntryTypeData} from "@/pages/entry-types/types";

class APIEntryType {
  async all(): Promise<DataEntryTypes | Error> {
    const args = {
      hint: 'loading entry types',
      method: 'GET',
      url: '/entry-types',
      isFn: isDataEntryTypes,
    } as ApiArgs<DataEntryTypes> ;

    return api(args);
  };

  async add(data: EntryTypeData): Promise<EntryTypeData | Error> {
    const args = {
      hint: 'adding entry type',
      method: 'POST',
      url: '/entry-types',
      isFn: isEntryTypeData,
      data,
    } as ApiArgs<EntryTypeData> ;

    return api(args);
  }
}

const apiEntryType = new APIEntryType();
Object.freeze(apiEntryType);

export default apiEntryType;
