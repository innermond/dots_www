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
  createResource,
  createComputed,
  createEffect,
} from 'solid-js';
import { Store, createStore } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';
import type { Accessor, Component } from 'solid-js';
import { AlertColor } from '@suid/material/Alert/AlertProps';

import type { EntryTypeData } from '@/pages/entry-types/types';
import { isEntryTypeData } from '@/pages/entry-types/types';
import { apiEntryType } from '@/api';
import type { MessagesMap, Validable, Validators } from '@/lib/form';
import { required, minlen, maxlen, validate } from '@/lib/form';
import { makeDefaults, FieldNames } from '@/lib/form';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';
import { zero } from '@/lib/api';

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
  dyn?: Component<{
    inputs: Store<Validable<keyof Omit<EntryTypeData, 'id'>>>;
    isDisabled: Accessor<boolean>;
  }>;
  names: string[];
} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  // open starts as undefined - means it has never been open
  const [open, setOpen] = props!.open;

  const handleCloseClick = () => {
    setOpen(false);
  };

  // must be true or false
  // it start as closed (false) when open() is undefined
  const closing = (): boolean => {
    const v = open();
    if (v === undefined) return false;
    return !v;
  };

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

  // set up validation
  const validators: Validators<Names> = {
    code: [required, minlen(7), maxlen(50)],
    description: [required, minlen(7), maxlen(100)],
    unit: [required, minlen(2), maxlen(20)],
  };

  // functions that prepare error messages
  const textmessages = [
    (f: string) => `${f} is required`,
    (f: string, v: string, { len }: { len: number }) =>
      `${f} must be more than ${len} - has ${v.length}`,
    (f: string, v: string, { len }: { len: number }) =>
      `${f} must be less than ${len} - has ${v.length}`,
  ];

  // map error messages with field names
  const messages: MessagesMap<Names> = {
    code: textmessages,
    description: textmessages,
    unit: textmessages,
  };

  // validate named fields and then
  // update the local inputs store
  const validateInputUpdateStore = (
    data: unknown,
    skipValidation: boolean = false,
  ): void => {
    const hasNameValue = 'name' in (data as any) && 'value' in (data as any);
    if (!hasNameValue) {
      return;
    }

    const { name, value } = data as any;
    if (!names.includes(name)) return;

    const multierrors: string[] = skipValidation
      ? []
      : validate<Names>(name, value, validators, messages);
    setInputs(name as Names, {
      value,
      error: multierrors.length > 0,
      message: multierrors,
    });
  };

  // respond to input events
  const handleInput = (e: Event): void => {
    e.preventDefault();
    if (!e.target) return;
    if (e.target instanceof HTMLFormElement) {
      Array.from(e.target.elements)
        .filter((t: Element) => 'id' in t && names.includes(t.id))
        .map((t: unknown) => validateInputUpdateStore(t));
      return;
    }
    validateInputUpdateStore(e.target);
  };

  // collect data from event
  function collectFormData<T>(
    form: HTMLFormElement,
    names: string[] | undefined,
  ): T {
    // prepare data from DOM
    const data = Array.from(new FormData(form).entries()).reduce(
      (
        acc: Record<string, FormDataEntryValue>,
        [k, v]: [string, FormDataEntryValue],
      ) => {
        if (!names?.includes(k)) {
          return acc;
        }
        acc[k] = v;
        return acc;
      },
      {} as Record<string, FormDataEntryValue>,
    );

    return data as T;
  }

  // submit data
  async function postEntryTypeData(e: Event) {
    e.preventDefault();
    if (!e.target) return;

    // prepare data from DOM
    // to pure data
    const requestData = collectFormData<Omit<EntryTypeData, 'id'>>(
      e.target as HTMLFormElement,
      names,
    );
    // fire request
    const [remote, abort] = apiEntryType.add(requestData);

    // closing while loading trigger request abortion
    const cancelRequest = () => closing() && submitForm.loading;

    createEffect(() => {
      if (cancelRequest()) {
        abort();
      }
    });

    return await remote;
  }

  // submitting driven by signals
  const [startSubmit, setStartSubmit] = createSignal<Event | null>();
  const [submitForm] = createResource(startSubmit, postEntryTypeData);

  createComputed(() => {
    const v = closing();
    if (v) {
      setInputs({ code: zero(), description: zero(), unit: zero(true) });
    }
    return v;
  });

  // vaidate and submit
  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();

    handleInput(evt);
    if (inputsHasErrors()) {
      return;
    }

    setStartSubmit(evt);
  };

  const isDisabled = () => submitForm.loading;

  createComputed(() => {
    if (submitForm.loading) {
      setLoading(true);
    }
  });

  createEffect(() => {
    if (submitForm.loading) {
      toasting.dismiss();
    }
  });

  const navigate = useNavigate();

  createComputed(() => {
    if (submitForm.state === 'ready') {
      setLoading(false);
      setInputs({ code: zero(), description: zero(), unit: zero(true) });
    }
  });

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as any;
      if (!(result instanceof Error) && result.hasOwnProperty('token_access')) {
        const token_access = result.token_access;
        const key = 'dots.tok';
        sessionStorage.setItem(key, token_access);
        navigate('/');
      }

      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result as EntryTypeData;
      toasting(`entry type "${code}" has been added`);
    }
  });

  createComputed(() => {
    if (submitForm.state === 'errored') {
      setLoading(false);
    }
  });

  createEffect(() => {
    if (submitForm.state === 'errored') {
      const data = submitForm.error;
      let severity = 'error' as AlertColor;
      let message =
        data?.message ??
        data?.error ??
        data?.cause?.error ??
        'An error occured';
      if (data.name === 'AbortError') {
        severity = 'info' as AlertColor;
        message = 'Adding a new entry type has been canceled by user';
      }
      toasting(message, severity);
    }
  });

  const appBar = (
    <AppBar color="transparent" sx={{ position: 'relative' }}>
      <Toolbar sx={{ pr: 0 }}>
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
          type="submit"
        >
          {props.textSave ?? 'save'}
        </Button>
      </Toolbar>
      <Divider />
    </AppBar>
  );

  const isOpen = () => open() ?? false;
  return (
    <Dialog
      fullWidth
      sx={{ alignItems: 'center' }}
      open={isOpen()}
      onClose={handleCloseClick}
      TransitionComponent={props.transition ?? defaultTransition}
    >
      <Show when={props.dyn}>
        <Container
          novalidate
          autocomplete="off"
          component="form"
          onSubmit={handleSubmit}
          onInput={handleInput}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 0,
          }}
        >
          {appBar}
          <Dynamic
            inputs={inputs}
            isDisabled={isDisabled}
            component={props.dyn}
          />
        </Container>
      </Show>
      {props.children}
    </Dialog>
  );
};

export default DialogSave;
