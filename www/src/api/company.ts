import {api, ApiArgs, query} from "@/lib/api";
import {DataCompanies, DataCompanyDepletion, DataCompanyStats, isDataCompanies, isDataCompanyDepletion, isDataCompanyStats} from "@/pages/company/types";

class APICompany {
  async all(): Promise<DataCompanies | Error> {
    const url = '/companies';

    const args = {
      hint: 'loading companies',
      method: 'GET',
      url,
      isFn: isDataCompanies,
    } as ApiArgs<DataCompanies> ;

    return api(args);
  }

  async one(id: string): Promise<DataCompanies | Error> {
    const url = query('/companies', {id});
    const args = {
      hint: 'loading company',
      method: 'GET',
      url,
      isFn: isDataCompanies,
    } as ApiArgs<DataCompanies> ;

    return api(args);
  }

  async stats(id: string): Promise<DataCompanyStats | Error> {
    const url = query('/companies/stats', {id});
    const args = {
      hint: 'getting stats of company',
      method: 'GET',
      url,
      isFn: isDataCompanyStats,
    } as ApiArgs<DataCompanyStats> ;

    return api(args);
  }

  async depletion(id: string): Promise<DataCompanyDepletion | Error> {
    const url = query('/companies/depletion?', {id});
    const args = {
      hint: 'getting depletion for company',
      method: 'GET',
      url,
      isFn: isDataCompanyDepletion,
    } as ApiArgs<DataCompanyDepletion> ;

    return api(args);
  }
}

const apiCompany = new APICompany();
Object.freeze(apiCompany);

export default apiCompany;
