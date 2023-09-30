import { JSX } from 'solid-js';
import {Box, CircularProgress } from '@suid/material';

const Progress = (): JSX.Element => (
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

export default Progress;
