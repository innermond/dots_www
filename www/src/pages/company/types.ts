import { ApiError } from '../../lib/api';

type CompanyData = {
  id: number;
  longname: string;
  rn: string;
  tin: string;
};

function isCompanyData(d: unknown): d is CompanyData {
  return (
    d instanceof Error ||
    ( !!d && typeof d === 'object' &&
      'id' in d && typeof d.id === 'number' &&
      'longname' in d && typeof d.longname === 'string' &&
      'rn' in d && typeof d.rn === 'string' &&
      'tin' in d && typeof d.tin === 'string')
  );
}

type DataCompanies = { data: (CompanyData | Error)[]; n: number };

function isDataCompanies(d: unknown): d is DataCompanies {
  if (d instanceof ApiError) {
    return true;
  }

  const seemsOk =
    !!d && 
    typeof d === 'object' && 
    'n' in d && typeof d?.n === 'number' &&
    'data' in d && Array.isArray(d?.data);
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

export type { CompanyData, DataCompanies };
export { isCompanyData, isDataCompanies, companyZero, companiesZero };
