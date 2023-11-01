import { createTheme } from '@suid/material/styles';
import Typography from './typography';
import Palette from './palette';

export const defaultTheme = createTheme({
  typography: Typography(`'Public Sans', sans-serif`),
  //palette: {mode: 'dark'},
  palette: Palette('light'),
});
