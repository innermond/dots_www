import { Button } from '@suid/material';
import type { ButtonProps } from '@suid/material/Button';
import AddIcon from '@suid/icons-material/Add';
import EditIcon from '@suid/icons-material/Edit';
import DeleteIcon from '@suid/icons-material/Delete';
import SaveIcon from '@suid/icons-material/Save';
import { Show } from 'solid-js';
import type { JSX } from 'solid-js';

type ActionButtonProps = ButtonProps & {
  kind?: 'edit' | 'add' | 'delete' | 'reset';
  text?: string;
  only?: 'text' | 'icon';
};
const ActionButton = (props: ActionButtonProps): JSX.Element => {
  let icon =
    props.kind === 'edit' ? (
      <EditIcon />
    ) : props.kind === 'add' ? (
      <AddIcon />
    ) : props.kind === 'delete' ? (
      <DeleteIcon />
    ) : (
      <SaveIcon />
    );

  let txt = props.text ?? props.kind ?? 'save';
  if (props.only === 'icon') {
    txt = '';
  }

  return props.only === 'text' ? (
    <Button variant="text" color="primary" type="submit" {...props}>
      {txt}
    </Button>
  ) : (
    <Button
      variant="contained"
      startIcon={icon}
      color="primary"
      type="submit"
      {...props}
    >
      {txt}
    </Button>
  );
};

export type { ActionButtonProps };
export default ActionButton;
