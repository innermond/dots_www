import {
  onMount,
  onCleanup,
  createResource,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import {useParams} from '@solidjs/router';

import appstate from '../../lib/app';
const { currentCompany, setCurrentPageTitle } = appstate;

const CompanyDetails: Component = (): JSX.Element => {
  const params = useParams();

  const delay = () => {
    return new Promise(resolve => {
      const timespan = 100;
      setTimeout(() => resolve(timespan), timespan);
    });
  };

  const [time] = createResource(delay);

  onMount(() => {
    const n = currentCompany().longname || 'Company'; 
    setCurrentPageTitle(n);
  });

  onCleanup(() => {
    console.log('CompanyDetails cleaned up');
  });

  return (
    <p>{params.id}
      {time() as string} {'CompanyDetails component works!'}
    </p>
  );
};

export default CompanyDetails;

