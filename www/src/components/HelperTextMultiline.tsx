import type { JSX } from 'solid-js';

import { For, Show } from 'solid-js';

import { Box, Stack } from '@suid/material';

const HelperTextMultiline = (props: { lines: string[] }): JSX.Element => {
  return (
    <Show when={!!props.lines?.length}>
      <Stack direction="column" component="span">
        <For each={props.lines}>
          {line => <Box component="span">{line}</Box>}
        </For>
      </Stack>
    </Show>
  );
};

export default HelperTextMultiline;
