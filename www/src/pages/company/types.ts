type CompanyData = {
  id: number;
  longname: string;
  rn: string;
  tin: string;
};

function isCompanyData(d: any): d is CompanyData {
  return (d instanceof Error) || ((typeof d?.id === 'number') && (typeof d?.longname === 'string') && (typeof d?.rn === 'string') && (typeof d?.tin === 'string'));
}

type DataCompanies = { data: (CompanyData | Error)[]; n: number };

function isDataCompanies(d: any): d is DataCompanies {
  return typeof d === 'object' && typeof d?.n === 'number' && isCompanyData(d?.data);
}

const companyZero = {
  id: 0,
  longname: '',
  rn: '',
  tin: '',
};

export type { CompanyData, DataCompanies };
export {isCompanyData, isDataCompanies, companyZero};
