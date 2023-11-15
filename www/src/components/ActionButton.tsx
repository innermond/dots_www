import { Button } from '@suid/material';
import type { ButtonProps } from '@suid/material/Button';
import AddIcon from '@suid/icons-material/Add';
import EditIcon from '@suid/icons-material/Edit';
import DeleteIcon from '@suid/icons-material/Delete';
import SaveIcon from '@suid/icons-material/Save';
import { Show } from 'solid-js';
import type { JSX } from 'solid-js';

type ActionButtonProps = ButtonProps & {
  kind?: 'edit' | 'add' | 'delete';
  text?: string;
};
const ActionButton = (props: ActionButtonProps): JSX.Element => {
  const icon =
    props.kind === 'edit' ? (
      <EditIcon />
    ) : props.kind === 'add' ? (
      <AddIcon />
    ) : props.kind === 'delete' ? (
      <DeleteIcon />
    ) : (
      <SaveIcon />
    );
  return (
    <Button
      variant="contained"
      startIcon={icon}
      color="primary"
      type="submit"
      {...props}
    >
      {props.text ?? props.kind ?? 'save'}
    </Button>
  );
};

export type { ActionButtonProps };
export default ActionButton;
