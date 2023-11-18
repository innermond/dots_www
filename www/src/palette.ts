// material-ui
import { DeepPartial } from '@suid/types';
import type { PaletteOptions } from '@suid/material/styles/createPalette';

// third-party
import { presetPalettes } from '@ant-design/colors';

// project import
import ThemeOption from './theme-option';

const Palette = (mode: PaletteOptions['mode']): DeepPartial<PaletteOptions> => {
  const colors = presetPalettes;

  const greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000',
  ];
  const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  const greyConstant = ['#fafafb', '#e6ebf1'];

  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  const paletteColor = ThemeOption(colors);

  return {
    mode,
    common: {
      black: '#000',
      white: '#fff',
    },
    ...paletteColor,
    text: {
      primary: paletteColor.grey[700],
      secondary: paletteColor.grey[500],
      disabled: paletteColor.grey[400],
    },
    action: {
      disabled: paletteColor.grey[50],
    },
    divider: paletteColor.grey[300],
    background: {
      paper: paletteColor.grey[0],
      default: paletteColor.grey.A50,
    },
  };
};

export default Palette;
