import { ApiError } from '../../lib/api';

type CompanyData = {
  id: number;
  longname: string;
  rn: string;
  tin: string;
};

type DataCompanies = { data: (CompanyData | Error)[]; n: number };

function isCompanyData(d: unknown): d is CompanyData {
  return (
    d instanceof Error ||
    (!!d &&
      typeof d === 'object' &&
      'id' in d &&
      typeof d.id === 'number' &&
      'longname' in d &&
      typeof d.longname === 'string' &&
      'rn' in d &&
      typeof d.rn === 'string' &&
      'tin' in d &&
      typeof d.tin === 'string')
  );
}

function isKeyofCompanyData(k: string): k is keyof CompanyData {
  return ['id', 'longname', 'rn', 'tin'].includes(k);
}

function isDataCompanies(d: unknown): d is DataCompanies {
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
    if (!isCompanyData(c)) {
      return false;
    }
  }

  return true;
}

type CompanyDepletionData = {
  entryTypeId: number;
  code: string;
  description: string;
  quantityInitial: number;
  quantityDrained: number;
};

function isCompanyDepletionData(d: unknown): d is CompanyDepletionData {
  if (!d || typeof d !== 'object') return false;
  if (d instanceof Error) {
    return true;
  }

  const compulsory =
    'entry_type_id' in d &&
    typeof d.entry_type_id === 'number' &&
    'code' in d &&
    typeof d.code === 'string' &&
    'quantity_initial' in d &&
    typeof d.quantity_initial === 'number' &&
    'quantity_drained' in d &&
    typeof d.quantity_drained === 'number';

  const optional =
    'description' in d ? typeof d.description === 'string' : true;

  return compulsory && optional;
}

type DataCompanyDepletion = { data: CompanyDepletionData; n: number };

function isDataCompanyDepletion(d: unknown): d is DataCompanyDepletion {
  if (d instanceof ApiError) {
    return true;
  }

  let seemsOk =
    !!d &&
    typeof d === 'object' &&
    'n' in d &&
    typeof d?.n === 'number' &&
    'data' in d &&
    Array.isArray(d.data) &&
    d.data.length > 0 &&
    d.data.every(isCompanyDepletionData);
  if (!seemsOk) {
    return false;
  }

  return true;
}

type CompanyStatsData = {
  countCompanies: number;
  countDeeds: number;
  countEntries: number;
  countEntryTypes: number;
};

type DataCompanyStats = { data: CompanyStatsData; n: number };

function isCompanyStatsData(d: unknown): d is CompanyStatsData {
  if (!d || typeof d !== 'object') return false;
  if (d instanceof Error) {
    return true;
  }

  return (
    'count_companies' in d &&
    typeof d.count_companies === 'number' &&
    'count_entries' in d &&
    typeof d.count_entries === 'number' &&
    'count_entry_types' in d &&
    typeof d.count_entry_types === 'number' &&
    'count_deeds' in d &&
    typeof d.count_deeds === 'number'
  );
}

function isDataCompanyStats(d: unknown): d is DataCompanyStats {
  if (d instanceof ApiError) {
    return true;
  }

  const seemsOk =
    !!d &&
    typeof d === 'object' &&
    'n' in d &&
    typeof d?.n === 'number' &&
    'data' in d &&
    isCompanyStatsData(d?.data);
  if (!seemsOk) {
    return false;
  }

  return true;
}

const companyZero: CompanyData = {
  id: 0,
  longname: '',
  rn: '',
  tin: '',
};

const companiesZero: DataCompanies = {
  data: [],
  n: 0,
};

export type {
  CompanyData,
  DataCompanies,
  CompanyStatsData,
  DataCompanyStats,
  CompanyDepletionData,
  DataCompanyDepletion,
};
export {
  isCompanyData,
  isKeyofCompanyData,
  isDataCompanies,
  isCompanyStatsData,
  isDataCompanyStats,
  isCompanyDepletionData,
  isDataCompanyDepletion,
  companyZero,
  companiesZero,
};
