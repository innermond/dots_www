import { createTheme } from '@suid/material/styles';
import Typography from './typography';
import Palette from './palette';

export const defaultTheme = createTheme({
  typography: Typography(`'Public Sans', sans-serif`),
  palette: Palette('light', 'default'),
});
/*const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});*/


