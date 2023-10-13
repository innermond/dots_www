import { onMount, onCleanup, createResource, createEffect } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { useParams } from '@solidjs/router';

import { company } from '../../lib/api';
import appstate from '../../lib/app';
const { currentCompany, setCurrentPageTitle } = appstate;

const CompanyDetails: Component = (): JSX.Element => {
  const params = useParams();

  const [companyRes] = createResource(()=>params.id, company.one);
  const data = (): string => {
    console.log(companyRes.state);
    if (companyRes.state === 'errored') {
      return companyRes.error?.message;
    }
    const inf = companyRes();
    if (! inf) {
      return 'nothing yet...';
    }
    return ''+inf;
  };

  createEffect(() => {
    if (companyRes.state === 'ready') {
      console.log(JSON.stringify(companyRes()));
      updateTitle();
    }
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
      {data()}
      {'CompanyDetails component works!'}
    </p>
  );
};

export default CompanyDetails;
