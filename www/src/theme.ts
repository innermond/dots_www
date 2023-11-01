import { createTheme } from '@suid/material/styles';
import Typography from './typography';
import Palette from './palette';

const typography = Typography(`'Public Sans', sans-serif`);
const palette = Palette('light');

const styleBorder = '1px solid ' + palette.grey![300];

const theme = createTheme({
  components: {
    MuiTable: {
      defaultProps: {
        sx: {border: styleBorder},
      },
     },
    MuiTableHead: {
      defaultProps: {
        sx: {
          "& tr": {
            backgroundColor: palette.grey![200],
            "&:hover th": {
              backgroundColor: 'transparent',
            },
          },
          "& th": {
            fontWeight: 700,
            textTransform: 'uppercase',
          }
        }
      }
    },
    MuiTableRow: {
      defaultProps: {
        sx: {
          borderBottom: styleBorder,
          "&:hover td": {
              backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTableCell: {
      defaultProps: {
        sx: {
          borderCollapse: 'separate',
          borderBottom: styleBorder,
          backgroundColor: palette.grey![50],
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
  typography,
  //palette: {mode: 'dark'},
  palette,
});


export default theme;
