import { onMount, type Component, type JSX, onCleanup, createResource, Show, createEffect } from 'solid-js';
import {setLoading} from '../components/Loading';

const Assignment: Component = (): JSX.Element =>  {
  console.log('outise');

  const delay = () => {
    return new Promise(resolve => {
      const timespan = 1000;
      setTimeout(() => resolve(timespan), timespan);
    });
  }

  const [time] = createResource(delay);

  onMount(() => {
    console.log('Accessor monted');
  });

  onCleanup(() => {
    console.log('Accessor cleaned up');
  })

  return (
      <p>{time() as string} {'Accessor component works!'}</p>
  );
};

export default Assignment;

