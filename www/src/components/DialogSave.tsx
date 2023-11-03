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
import { JSX, ParentProps, Signal } from 'solid-js';
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
} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  const [open, setOpen] = props!.open;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      fullWidth
      open={open()}
      onClose={handleClose}
      onClick={handleClick}
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
      {props.children}
    </Dialog>
  );
};

const handleClick = (evt: Event) => {
  evt.stopPropagation();
  const e = new CustomEvent('postEntryType', { bubbles: true });
  evt.target?.dispatchEvent(e);
};

const With = (props: DialogSaveProps & { dyn: Component }): JSX.Element => {
  return (
    <DialogSave title={props.title} textSave={props.textSave} open={props.open}>
      <Dynamic component={props.dyn} />
    </DialogSave>
  );
};

DialogSave.With = With;
export default DialogSave;
