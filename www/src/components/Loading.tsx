import { Box, LinearProgress, useTheme } from '@suid/material';
import { Show, createSignal } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { Backdrop } from '@suid/material';

export const [loading, setLoading] = createSignal(false);

type PropsLoading = {
  open: boolean;
};

const Loading: Component<PropsLoading> = (props): JSX.Element => {
  const theme = useTheme();

  return (
    <Show when={props?.open}>
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
      <Backdrop open={props?.open}></Backdrop>
    </Show>
  );
};

export default Loading;
