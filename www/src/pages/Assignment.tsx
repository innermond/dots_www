import {useRouteData} from '@solidjs/router';
import { onMount, type Component, type JSX, onCleanup } from 'solid-js';
import {setLoading} from '../components/Loading';

const Assignment: Component = (): JSX.Element =>  {
  onMount(() => {
    const data: any = useRouteData();
    console.log('Accessor monted', data());
    setLoading(false);
  });

  onCleanup(() => {
    console.log('Accessor cleaned up');
    setLoading(true);
  })
  return <p>Assignment component works!</p>
};

export default Assignment;

