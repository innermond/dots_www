import type { Component } from 'solid-js';
import { For } from 'solid-js';

const ErrorMessage: Component<ErrorProps> = (props) => {
  return (
  <For each={props.errors}>
    {(error) => <div class="error-message">{error.message}</div>}
    </For>
  )
};

type ErrorProps = {
  errors: Error[]
};

export default ErrorMessage;
