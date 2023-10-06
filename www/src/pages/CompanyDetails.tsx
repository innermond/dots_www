import {
  onMount,
  type Component,
  type JSX,
  onCleanup,
  createResource,
} from 'solid-js';

const CompanyDetails: Component = (): JSX.Element => {
  console.log('outise');

  const delay = () => {
    return new Promise(resolve => {
      const timespan = 1000;
      setTimeout(() => resolve(timespan), timespan);
    });
  };

  const [time] = createResource(delay);

  onMount(() => {
    console.log('CompanyDetails monted');
  });

  onCleanup(() => {
    console.log('CompanyDetails cleaned up');
  });

  return (
    <p>
      {time() as string} {'CompanyDetails component works!'}
    </p>
  );
};

export default CompanyDetails;

