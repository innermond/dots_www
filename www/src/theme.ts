import { createTheme } from '@suid/material/styles';
import Typography from './typography';
import Palette from './palette';

const theme = createTheme({
  components: {
    MuiTableHead: {
      defaultProps: {
        sx: {
          "& th": {
          fontWeight: 600,
          }
        }
      }
    }
  },
  typography: Typography(`'Public Sans', sans-serif`),
  //palette: {mode: 'dark'},
  palette: Palette('light'),
});


export default theme;
