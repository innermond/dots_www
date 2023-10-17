import {
  onMount,
  onCleanup,
  createResource,
  createEffect,
  createMemo,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { useParams } from '@solidjs/router';

import type { CompanyData, DataCompanies } from '@/pages/company/types';
import { isDataCompanies } from '@/pages/company/types';
import { ApiError, company } from '@/lib/api';
import toasting from '@/lib/toast';
import appstate from '@/lib/app';
const { currentCompany, setCurrentCompany, setCurrentPageTitle } = appstate;

const CompanyDetails: Component = (): JSX.Element => {
  const params = useParams();
  const [companyRes] = createResource(() => params.id, company.one);
  const data = createMemo((): DataCompanies | Error | undefined => {
    if (companyRes.state === 'errored') {
      return companyRes.error;
    }

    if (companyRes.state === 'ready') {
      const inf = companyRes();
      return inf;
    }
  });

  createEffect(() => {
    if (!data()) return;

    if (!isDataCompanies(data())) {
      toasting('data we got do no represent a company');
      return;
    }

    const dcc = data() as DataCompanies;
    if (dcc.n === 0) {
      toasting('received empty data company', 'warning');
      return;
    }

    const info: CompanyData | Error = dcc.data[0];
    // error from server
    if (info instanceof ApiError) {
      if (info.response.status === 401) {
        throw info;
      }
      toasting(info.message, 'error');
      // cut it here
      return;
    } else if (info instanceof Error) {
      // error from client
      toasting(info.message, 'error');
      // cut it here
      return;
    }

    // all ok
    setCurrentCompany(info);
    updateTitle();
  });

  const updateTitle = () => {
    const n = currentCompany().longname || 'Company';
    setCurrentPageTitle(n);
  };

  onMount(updateTitle);

  onCleanup(() => {
    console.log('CompanyDetails cleaned up');
  });

  return (
    <p>
      {params.id}
      {'CompanyDetails component works!'}
    </p>
  );
};

export default CompanyDetails;
