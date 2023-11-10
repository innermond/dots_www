import CloseIcon from '@suid/icons-material/Close';
import {
  Button,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  Divider,
} from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import { TransitionProps } from '@suid/material/transitions';
import {
  JSX,
  ParentProps,
  Signal,
  createSignal,
  Accessor,
  createMemo,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { Component } from 'solid-js';

const Transition = function Transition(
  props: TransitionProps & {
    children: JSX.Element;
  },
) {
  return <Slide direction="up" {...props} />;
};

export type DialogSaveProps = {
  open: Signal<boolean | undefined>;
  title: string;
  textSave?: string;
  dyn?: Component<{ closing: Accessor<boolean>; action: Signal<boolean> }>;
} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  // open starts as undefined - means it has never been open
  const [open, setOpen] = props!.open;

  const handleCloseClick = () => {
    setOpen(false);
  };

  const actionSignal = createSignal(false);
  const [, setAction] = actionSignal;

  const handleActionClick = () => {
    setAction(true);
  };

  // must be true or false
  // it start as closed (false) when open() is undefined
  const closing = (): boolean => {
    const v = open();
    if (v === undefined) return false;
    return !v;
  };

  let Dyn: JSX.Element;
  if (props.dyn) {
    Dyn = (
      <Dynamic closing={closing} action={actionSignal} component={props.dyn} />
    );
  }

  const isOpen = () => open() ?? false;
  return (
    <Dialog
      fullWidth
      open={isOpen()}
      onClose={handleCloseClick}
      TransitionComponent={Transition}
    >
      <AppBar color="transparent" sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleCloseClick}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{
              ml: 2,
              flex: 1,
            }}
            variant="h6"
            component="div"
          >
            {props.title}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleActionClick}
          >
            {props.textSave ?? 'save'}
          </Button>
        </Toolbar>
        <Divider />
      </AppBar>
      {Dyn}
      {props.children}
    </Dialog>
  );
};

export default DialogSave;
