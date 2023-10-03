import { JSX, createSignal, onMount, onCleanup } from 'solid-js';
import { Box, CircularProgress } from '@suid/material';

type PropsOutput = { notifyIsRunning?: boolean };

const [isRunning, setIsRunning] = createSignal<boolean>();

const Progress = (props: PropsOutput): JSX.Element => {
  if (props?.notifyIsRunning) {
    onMount(() => setIsRunning(true));
    onCleanup(() => setIsRunning(false));
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export { isRunning };
export default Progress;
