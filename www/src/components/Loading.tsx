import { Box, LinearProgress, useTheme } from '@suid/material';
import { Show, createSignal } from 'solid-js';

export const [loading, setLoading] = createSignal(false);

export default function Loading() {
  const theme = useTheme();

  return (
    <Show when={loading()}>
      <Box sx={{ width: '100%', top: '0', position: 'absolute', zIndex: theme.zIndex.appBar + 1}}>
        <LinearProgress variant="indeterminate" />
      </Box>
    </Show>
  );
}
