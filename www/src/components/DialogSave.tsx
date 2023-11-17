import CloseIcon from '@suid/icons-material/Close';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  Divider,
  Container,
  useTheme,
} from '@suid/material';
import { TransitionProps } from '@suid/material/transitions';
import {
  JSX,
  ParentProps,
  Signal,
  createSignal,
  createResource,
  createComputed,
  createEffect,
} from 'solid-js';
import { SetStoreFunction, Store, createStore, unwrap } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';
import type { Accessor, Component, Setter } from 'solid-js';
import { AlertColor } from '@suid/material/Alert/AlertProps';

import type { EntryTypeData } from '@/pages/entry-types/types';
import { isEntryTypeData } from '@/pages/entry-types/types';
import type { InnerValidation, Validable } from '@/lib/form';
import { validate } from '@/lib/form';
import { makeDefaults, FieldNames } from '@/lib/form';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';
import ActionButton from '@/components/ActionButton';
import type { ActionButtonProps } from '@/components/ActionButton';

const theme = useTheme();

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
  dyn: Component<{
    inputs: Store<Validable<string>>;
    setInputs: SetStoreFunction<any>;
    isDisabled: Accessor<boolean>;
    setValidation: Setter<InnerValidation<string>>;
  }>;
  names: string[];
  sendRequestFn: Function;
  intialInputs?: any;
} & ParentProps;

const DialogSave = (props: DialogSaveProps) => {
  // open starts as undefined - means it has never been open
  const [open, setOpen] = props!.open;

  const handleCloseClick = () => {
    setOpen(false);
  };

  const closing = (): boolean => {
    const v = open();
    return !v;
  };

  const names = props.names;
  type Names = FieldNames<typeof names>;

  // set up local state for the inputs named above
  let defaultInputs = makeDefaults(props.intialInputs, ...names);
  const [inputs, setInputs] = createStore(defaultInputs);
  const inputsHasErrors = () => {
    for (const name of names) {
      if (inputs[name].error) {
        return true;
      }
    }
    return false;
  };
  const zeroingInputs = () =>
    setInputs(makeDefaults(props.intialInputs, ...names));

  const [validation, setValidation] = createSignal<InnerValidation<string>>({
    validators: {},
    messages: {},
  });

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

    const fail = unwrap(validation());

    const { name, value } = data as any;
    if (!names.includes(name)) return;

    const errorstr: string = skipValidation
      ? ''
      : validate<Names>(name, value, fail!.validators, fail!.messages);
    setInputs(name as Names, {
      value,
      error: errorstr.length > 0,
      message: errorstr,
    });
  };

  // respond to input events
  const handleInput = (e: Event): void => {
    if (!e.target) return;
    if (e.target instanceof HTMLFormElement) {
      Array.from(e.target.elements)
        .filter((t: Element) => 'id' in t && names.includes(t.id))
        .map((t: unknown) => validateInputUpdateStore(t));
      return;
    }
    validateInputUpdateStore(e.target);
  };

  const handleReset = (): void => {
    zeroingInputs();
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
  async function sendRequest(e: Event) {
    e.preventDefault();
    if (!e.target) return;

    // prepare data from DOM
    // to pure data
    const requestData = collectFormData(e.target as HTMLFormElement, names);
    // fire request
    const [remote, abort] = props.sendRequestFn(requestData);

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
  const [submitForm] = createResource(startSubmit, sendRequest);

  createComputed(() => {
    const v = closing();
    if (v) {
      zeroingInputs();
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

  // ensures "real-time" validation for burried unit inside InputOrSelect
  createComputed((v: any) => {
    if (v === undefined) return;
    validateInputUpdateStore({ name: 'unit', value: inputs.unit.value });
    return Math.random();
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
      zeroingInputs();
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

  const isDisabledActionButton = () =>
    inputs.code.error || inputs.description.error || inputs.unit.error;

  const appBar = (
    <AppBar
      color="transparent"
      sx={{ position: 'relative', mt: theme.spacing(1) }}
    >
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
          variant="h5"
          component="div"
        >
          {props.title}
        </Typography>
        <ActionButton
          kind="reset"
          only="text"
          type="reset"
          color="error"
          size="small"
        />
        <ActionButton
          disabled={isDisabledActionButton()}
          kind={props.textSave?.toLowerCase() as ActionButtonProps['kind']}
        />
      </Toolbar>
      <Divider />
    </AppBar>
  );

  const dynamic = (
    <Dynamic
      inputs={inputs}
      setInputs={setInputs}
      isDisabled={isDisabled}
      setValidation={setValidation}
      component={props.dyn}
    />
  );

  return (
    <Dialog
      fullWidth
      sx={{ alignItems: 'center' }}
      open={open() ?? false}
      onClose={handleCloseClick}
      TransitionComponent={props.transition ?? defaultTransition}
    >
      <Container
        novalidate
        autocomplete="off"
        spellcheck={false}
        component="form"
        onSubmit={handleSubmit}
        onInput={handleInput}
        onReset={handleReset}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {appBar}
        {dynamic}
      </Container>
    </Dialog>
  );
};

export default DialogSave;
