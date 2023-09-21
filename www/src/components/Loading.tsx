import { Box, LinearProgress } from '@suid/material';
import { Show, createSignal } from 'solid-js';

export const [loading, setLoading] = createSignal(false);

export default function Loading() {
  return (
    <Show when={loading()}>
      <Box sx={{ width: '100%', top: '0', position: 'absolute' }}>
        <LinearProgress variant="indeterminate" />
      </Box>
    </Show>
  );
}
