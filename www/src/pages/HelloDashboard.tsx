import { onMount, type Component, type JSX, onCleanup, createResource } from 'solid-js';

const HelloDashboard: Component = (): JSX.Element =>  {
  console.log('outise');

  const delay = () => {
    return new Promise(resolve => {
      const timespan = 1000;
      setTimeout(() => resolve(timespan), timespan);
    });
  }

  const [time] = createResource(delay);

  onMount(() => {
    console.log('HelloDashboard monted');
  });

  onCleanup(() => {
    console.log('HelloDashboard cleaned up');
  });

  return (
      <p>{time() as string} {'HelloDashboard component works!'}</p>
  );
   
};

export default HelloDashboard;

