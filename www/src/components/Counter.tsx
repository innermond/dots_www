import type { Component } from 'solid-js';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

const Counter: Component<{}> = () => {
  const [count, setCount] = createSignal<number>(0);
  let timerID: number | null = setInterval(() => {
    setCount(c => c + 1);
    console.log('tick timer');
  }, 1000);

  const [unmount, setUnmount] = createSignal<boolean>(false);
  let el: any;

  createEffect(() => {
    if (unmount()) {
      timerID && clearInterval(timerID);
      timerID = null;
      el?.remove();
      return;
    }
  });

  onMount(() => console.log('mount counter'));

  onCleanup(() => {
    console.log('clean up timer');
    timerID && clearInterval(timerID);
  });

  const fntrue = () => true;

  return (
    <div ref={el}>
      {count() > 3 ? null : <p>counter: {count()}</p>}
      <button onClick={[setUnmount, fntrue]}>unmount</button>
    </div>
  );
};

export default Counter;
