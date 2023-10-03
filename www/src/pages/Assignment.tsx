import {
  onMount,
  type Component,
  type JSX,
  onCleanup,
  createResource,
} from 'solid-js';

const Assignment: Component = (): JSX.Element => {
  console.log('outise');

  const delay = () => {
    return new Promise(resolve => {
      const timespan = 2000;
      setTimeout(() => resolve(timespan), timespan);
    });
  };

  const [time] = createResource(delay);

  onMount(() => {
    console.log('Accessor monted');
  });

  onCleanup(() => {
    console.log('Accessor cleaned up');
  });

  return (
    <p>
      {time() as string} {'Accessor component works!'}
    </p>
  );
};

export default Assignment;
