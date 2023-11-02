import CloseIcon from "@suid/icons-material/Close";
import {
  Button,
  Dialog,
  ListItem,
  ListItemText,
  ListItemButton,
  List,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
} from "@suid/material";
import { TransitionProps } from "@suid/material/transitions";
import { ComponentProps, createSignal, JSXElement, lazy, ParentProps, Signal } from "solid-js";
import {Dynamic} from "solid-js/web";

const Transition = function Transition(
  props: TransitionProps & {
    children: JSXElement;
  }
) {
  return <Slide direction="up" {...props} />;
};

export type DialogSaveProps = {open: Signal<boolean>, title: string, textSave?: string} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  const [open, setOpen] = props!.open;

  const handleClose = () => {
    setOpen(false);
  };

  return (
      <Dialog
        open={open()}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
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
            <Button autofocus color="inherit" onClick={handleClose}>
              {props.textSave ?? 'save'}
            </Button>
          </Toolbar>
        </AppBar>
        {props.children}
      </Dialog>
  );
}

export  const makeDialogSave = (props: DialogSaveProps & {path: string}): JSXElement => {
    const cmp = lazy(()=>import(props.path));
    return (
      <DialogSave title={props.title} textSave={props.textSave} open={props.open} >
        <Dynamic component={cmp} />
      </DialogSave>
    )
  }

export default DialogSave;
