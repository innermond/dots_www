import { JSX, createSignal, onMount, onCleanup } from 'solid-js';
import { Box, CircularProgress } from '@suid/material';
import { CircularProgressProps } from '@suid/material/CircularProgress';

type PropsOutput = CircularProgressProps & {
  notifyIsRunning?: boolean;
  height?: string;
  padding?: string;
};

const [isRunning, setIsRunning] = createSignal<boolean>();

const Progress = (props: PropsOutput): JSX.Element => {
  if (props?.notifyIsRunning) {
    onMount(() => setIsRunning(true));
    onCleanup(() => setIsRunning(false));
  }

  const { notifyIsRunning, height, ...circularProgressProps } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: props.height || '100vh',
        padding: props.padding || '0',
      }}
    >
      <CircularProgress {...circularProgressProps} />
    </Box>
  );
};

export { isRunning };
export default Progress;
