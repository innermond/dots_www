import { Box, LinearProgress, useTheme } from '@suid/material';
import { Show, createSignal, createEffect } from 'solid-js';
import { useIsRouting } from '@solidjs/router';
import { Backdrop } from '@suid/material';

export const [loading, setLoading] = createSignal(false);

export default function Loading() {
  const isRouting = useIsRouting();
  createEffect(() => {
    setLoading(isRouting());
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
