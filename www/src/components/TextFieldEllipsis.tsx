import styled from '@suid/system/styled';
import { TextField } from '@suid/material';

const TextFieldEllipsis = styled(TextField)({
  '& .MuiInputBase-input': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export default TextFieldEllipsis;
