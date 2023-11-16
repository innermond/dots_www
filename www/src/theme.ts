import { createTheme } from '@suid/material/styles';
import Typography from './typography';
import Palette from './palette';

const typography = Typography(`'Public Sans', sans-serif`);
const palette = Palette('light');

const styleBorder = '1px solid ' + palette.grey![300];

const theme = createTheme({
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiTable: {
      defaultProps: {
        sx: { border: styleBorder },
      },
    },
    MuiTableHead: {
      defaultProps: {
        sx: {
          '& tr': {
            backgroundColor: palette.grey![200],
            '&:hover th': {
              backgroundColor: 'transparent',
            },
          },
          '& th': {
            fontWeight: 700,
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiTableRow: {
      defaultProps: {
        sx: {
          '&:hover td': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTableCell: {
      defaultProps: {
        sx: {
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
    /*MuiFormHelperText: {
    defaultProps: {
      sx: {
        'root': {
          transition: 'height 2s',
          height: 0,
          overflow: 'hidden',
        },
        '& .MuiFormHelperText-root.MuiFormHelperText-contained.Mui-error': {
          height: '2rem!important',
        }, 
      }
    },
},*/
  },
  typography,
  //palette: {mode: 'dark'},
  palette,
});

export default theme;
