import {useRouteData} from '@solidjs/router';
import { onMount, type Component, type JSX, Accessor, onCleanup } from 'solid-js';
import {setLoading} from '../components/Loading';

const HelloDashboard: Component = (): JSX.Element =>  {
  onMount(() => {
    const data: any = useRouteData();
    console.log('HelloDashboard monted', data());
    setLoading(false);
  });

  onCleanup(() => {
    console.log('HelloDashboard cleaned up');
    setLoading(true);
  })

  return <p>HelloDashboard component works!</p>
};

export default HelloDashboard;

