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
  Container,
} from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import { TransitionProps } from '@suid/material/transitions';
import {
  Show,
  JSX,
  ParentProps,
  Signal,
  createSignal,
  Accessor,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';
import type { Component } from 'solid-js';
import { makeDefaults, FieldNames } from '@/lib/form';

const defaultTransition = function (
  props: TransitionProps & {
    children: JSX.Element;
  },
): JSX.Element {
  return <Slide direction="up" {...props} />;
};

export type DialogSaveProps = {
  open: Signal<boolean | undefined>;
  title: string;
  textSave?: string;
  transition?: Component<TransitionProps & { children: JSX.Element }>;
  dyn?: Component<{ closing: Accessor<boolean>; action: Signal<boolean> }>;
  names: string[];
} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  // open starts as undefined - means it has never been open
  const [open, setOpen] = props!.open;

  const handleCloseClick = () => {
    setOpen(false);
  };

  const actionSignal = createSignal(false);
  const [, setAction] = actionSignal;

  const handleActionClick = (evt: Event) => {
    evt.preventDefault();
    formRef?.requestSubmit();
  };
  const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    setAction(true);
  };

  // must be true or false
  // it start as closed (false) when open() is undefined
  const closing = (): boolean => {
    const v = open();
    if (v === undefined) return false;
    return !v;
  };

  let formRef: HTMLFormElement | undefined;

  const names = props.names;
  type Names = FieldNames<typeof names>;

  // set up local state for the inputs named above
  const defaultInputs = makeDefaults(...names);
  const [inputs, setInputs] = createStore(defaultInputs);
  const inputsHasErrors = () => {
    for (const name of names) {
      if (inputs[name].error) {
        return true;
      }
    }
    return false;
  };

  const isOpen = () => open() ?? false;
  return (
    <Dialog
      fullWidth
      open={isOpen()}
      onClose={handleCloseClick}
      TransitionComponent={props.transition ?? defaultTransition}
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
      <Show when={props.dyn}>
        <Container
          ref={formRef}
          novalidate
          autocomplete="off"
          component="form"
          onSubmit={handleSubmit}
        >
          <Dynamic
            closing={closing}
            action={actionSignal}
            component={props.dyn}
          />
        </Container>
      </Show>
      {props.children}
    </Dialog>
  );
};

export default DialogSave;
