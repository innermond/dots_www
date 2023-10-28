import { Box, LinearProgress, useTheme } from '@suid/material';
import { onMount, Show, createSignal, createEffect } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { useIsRouting } from '@solidjs/router';
import { Backdrop } from '@suid/material';

export const [loading, setLoading] = createSignal(false);

type PropsLoading = {
  open?: boolean
};

const Loading: Component<PropsLoading> = (props): JSX.Element => {
  const isRouting = useIsRouting();
  createEffect(() => {
    setLoading(isRouting());
  });

  onMount(() => {
    if (props.open) {
      setLoading(true);
    }
  });

  const theme = useTheme();

  return (
    <Show when={loading()}>
      <Box
        sx={{
          width: '100%',
          top: '0',
          position: 'absolute',
          zIndex: theme.zIndex.appBar + 1,
        }}
      >
        <LinearProgress variant="indeterminate" />
      </Box>
      <Backdrop open={loading()}></Backdrop>
    </Show>
  );
}

export default Loading;
