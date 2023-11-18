import { createTheme, useTheme } from '@suid/material/styles';
import Typography from './typography';
import Palette from './palette';

const typography = Typography(`'Public Sans', sans-serif`);
const palette = Palette('light');

const materialTheme = useTheme();

const theme = createTheme({
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiTable: {
      defaultProps: {
        sx: { border: 'none' },
      },
    },
    MuiTableHead: {
      defaultProps: {
        sx: {
          fontWeight: 600,
          '& tr': {
            backgroundColor: palette.grey![300],
            '&:hover th': {
              backgroundColor: 'transparent',
            },
          },
          '& th': {
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: palette.grey![200],
            '&:last-child': { pr: materialTheme.spacing(1) },
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
          fontSize: '0.875rem',
          padding: 0,
          borderColor: palette.divider,
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
