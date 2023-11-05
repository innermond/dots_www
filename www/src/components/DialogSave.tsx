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
import { JSX, ParentProps, Signal, createSignal } from 'solid-js';
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
  open: Signal<boolean>;
  title: string;
  textSave?: string;
  dyn?: Component<{ action: Signal<boolean> }>;
} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  const [open, setOpen] = props!.open;

  const handleClose = () => {
    setOpen(false);
  };

  const actionSignal = createSignal(false);
  const [, setAction] = actionSignal;

  const handleClick = () => {
    setAction(true);
  };

  let Dyn: JSX.Element;
  if (props.dyn) {
    Dyn = <Dynamic action={actionSignal} component={props.dyn} />;
  }

  return (
    <Dialog
      fullWidth
      open={open()}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar color="transparent" sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
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
            onClick={handleClick}
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
