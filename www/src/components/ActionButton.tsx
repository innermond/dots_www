import { Button } from '@suid/material';
import type { ButtonProps } from '@suid/material/Button';
import AddIcon from '@suid/icons-material/Add';
import EditIcon from '@suid/icons-material/Edit';
import DeleteIcon from '@suid/icons-material/Delete';
import SaveIcon from '@suid/icons-material/Save';
import { splitProps } from 'solid-js';
import type { JSX } from 'solid-js';

type ActionButtonProps = ButtonProps & {
  kind?: 'edit' | 'add' | 'delete' | 'action' | 'reset';
  text?: string;
  only?: 'text' | 'icon';
};
const ActionButton = (props: ActionButtonProps): JSX.Element => {
  const [my, buttonProps] = splitProps(props, ['kind', 'text', 'only']);

  let icon = <SaveIcon />;
  if (my.kind === 'edit') {
    icon = <EditIcon />;
  } else if (my.kind === 'add') {
    icon = <AddIcon />;
  } else if (my.kind === 'delete') {
    icon = <DeleteIcon />;
  }

  let txt = buttonProps?.children ?? my.text ?? my.kind ?? 'save';
  if (my.only === 'icon') {
    txt = '';
  }

  if (my.only === 'text') {
    return (
      <Button
        disabled={props.disabled}
        variant="text"
        color="primary"
        type="submit"
        {...buttonProps}
      >
        {txt}
      </Button>
    );
  }

  if (my.only === 'icon') {
    icon = buttonProps?.startIcon ?? icon;
    return (
      <Button
        variant="contained"
        startIcon={icon}
        color="primary"
        type="submit"
        disabled={props.disabled}
        {...buttonProps}
      />
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={icon}
      color="primary"
      type="submit"
      {...buttonProps}
    >
      {txt}
    </Button>
  );
};

export type { ActionButtonProps };
export default ActionButton;
