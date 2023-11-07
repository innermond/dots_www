import { ApiError } from '../../lib/api';

type EntryTypeData = {
  id: number;
  code: string;
  description: string;
  unit: string;
};

type DataEntryTypes = { data: (EntryTypeData | Error)[]; n: number };

function isEntryTypeData(d: unknown): d is EntryTypeData {
  return (
    d instanceof Error ||
    (!!d &&
      typeof d === 'object' &&
      'id' in d &&
      typeof d.id === 'number' &&
      'code' in d &&
      typeof d.code === 'string' &&
      // description may miss - optional
      ('description' in d ? typeof d.description === 'string' : true) &&
      'unit' in d &&
      typeof d.unit === 'string')
  );
}

type DataEntryTypeUnits = { data: (string | Error)[]; n: number };

function isKeyofEntryTypeData(k: string): k is keyof EntryTypeData {
  return ['id', 'code', 'description', 'unit'].includes(k);
}

function isDataEntryTypeUnits(d: unknown): d is DataEntryTypeUnits {
  if (d instanceof ApiError) {
    return true;
  }

  const seemsOk =
    !!d &&
    typeof d === 'object' &&
    'n' in d &&
    typeof d?.n === 'number' &&
    'data' in d &&
    Array.isArray(d?.data);
  if (!seemsOk) {
    return false;
  }
  // check data
  for (const c of d.data as any) {
    if (typeof c !== 'string') {
      return false;
    }
  }

  return true;
}

function isDataEntryTypes(d: unknown): d is DataEntryTypes {
  if (d instanceof ApiError) {
    return true;
  }

  const seemsOk =
    !!d &&
    typeof d === 'object' &&
    'n' in d &&
    typeof d?.n === 'number' &&
    'data' in d &&
    Array.isArray(d?.data);
  if (!seemsOk) {
    return false;
  }
  // check data
  for (const c of d.data as any) {
    if (!isEntryTypeData(c)) {
      return false;
    }
  }

  return true;
}

const entryTypeZero: EntryTypeData = {
  id: 0,
  code: '',
  description: '',
  unit: '',
};

const entryTypesZero: DataEntryTypes = {
  data: [],
  n: 0,
};

export type { EntryTypeData, DataEntryTypes, DataEntryTypeUnits };
export {
  isEntryTypeData,
  isKeyofEntryTypeData,
  isDataEntryTypes,
  isDataEntryTypeUnits,
  entryTypeZero,
  entryTypesZero,
};
