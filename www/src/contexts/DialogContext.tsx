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
  CircularProgress,
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
  useContext,
  Show,
  Suspense,
  onCleanup,
  createMemo,
  batch,
  untrack,
} from 'solid-js';
import { SetStoreFunction, Store, createStore, unwrap } from 'solid-js/store';
import type { Accessor, Component, Resource, Setter } from 'solid-js';
import { AlertColor } from '@suid/material/Alert/AlertProps';

import type { InnerValidation, Validable } from '@/lib/form';
import { validate } from '@/lib/form';
import { makeValidable } from '@/lib/form';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';
import ActionButton from '@/components/ActionButton';
import type { ActionButtonProps } from '@/components/ActionButton';
import { createContext } from 'solid-js';
import { dispatch } from '@/lib/customevent';
import AlertDialog, { AlertDialogState } from '@/components/AlertDialog';

const theme = useTheme();

const defaultTransition = function (
  props: TransitionProps & {
    children: JSX.Element;
  },
): JSX.Element {
  return <Slide direction="up" {...props} />;
};

export type DialogProviderValue<T extends {}> = {
  setUI: SetStoreFunction<DialogState>;
  inputs: Store<Validable<T>>;
  setInputs: SetStoreFunction<Validable<T>>;
  setInitialInputs: Setter<T>;
  isDisabled: Accessor<boolean>;
  setValidation: Setter<InnerValidation<string>>;
  submitForm: Resource<T>;
  validateInputUpdateStore: (data: unknown, skipValidation?: boolean) => void;
  handleChange: any;
};

export type DialogSaveProps<T extends {}> = {
  open: Signal<boolean>;
  title: string;
  textSave?: string;
  transition?: Component<TransitionProps & { children: JSX.Element }>;
  names: string[];
  sendRequestFn: Function;
  initialInputs: Accessor<T>;
  setInitialInputs: Setter<T>;
  allowStopRequest?: boolean;
} & ParentProps;

type DialogState = {
  show: {
    reset: boolean;
    stop: boolean;
    action: boolean;
  };
  ready: boolean;
};

const DialogContext = createContext();
// T is typeof data to be sent
const DialogProvider = <T extends {}>(props: DialogSaveProps<T>) => {
  const initialUi = {
    show: { reset: true, stop: !!props.allowStopRequest, action: true },
    ready: false,
  };
  const initialState: DialogState = initialUi;
  const [ui, setUI] = createStore(initialState);

  // open starts as undefined - means it has never been open
  const [open, setOpen] = props!.open;

  const handleCloseClick = () => {
    if (submitForm.loading) {
      toasting('wait for operation to complete', 'warning');
      return;
    }
    setOpen(false);
  };

  onCleanup(() => {
    setLoading(false);
  });

  const closing = (): boolean => {
    const v = open();
    return !v;
  };

  // abort request
  const [cut, setCut] = createSignal(false);

  const names = props.names;
  type Names = (typeof names)[number];

  const initialValues: T = props.initialInputs();
  // set up local state for the inputs named above
  // TODO make it unchangebla - currently is flawed
  let defaultInputs: Validable<typeof initialValues>;
  try {
    defaultInputs = makeValidable(initialValues, ...names);
  } catch (err) {
    toasting((err as any).error, 'error');
    return;
  }
  // spread defaultInputs as being a store means it is modified
  // by operations done over store
  // and defaultInputs will unexpectedly by changed
  const [inputs, setInputs] = createStore<Validable<T>>({ ...defaultInputs });
  const inputsHasErrors = () => {
    for (const name of names) {
      if (name in inputs && inputs[name as keyof T].error) {
        return true;
      }
    }
    return false;
  };
  const zeroingInputs = () => {
    const initial = props.initialInputs();
    const init = makeValidable(initial, ...names);
    setInputs(init);
  };

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

    type KeyValfromT = { name: keyof T; value: T[typeof name] };
    const { name, value } = data as KeyValfromT;

    if (!names.includes(name as string)) return;

    const errorstr: string = skipValidation
      ? ''
      : validate<Names>(
          name as string,
          value,
          fail!.validators,
          fail!.messages,
        );
    const v = {
      value: value as T[keyof T],
      error: errorstr.length > 0,
      message: errorstr,
    };
    setInputs((prev: Validable<T>) => ({ ...prev, [name]: v }));
  };

  const handleReset = (evt: Event): void => {
    evt.preventDefault();
    let changed = false;
    let dontCheckChanged = true === names.includes('dontCheckChanged');
    if (dontCheckChanged) {
      changed = true;
    } else {
      for (const n of names) {
        // != ensure strings like numbers are equal with numbers
        if (
          props.initialInputs()[n as keyof typeof props.initialInputs] !=
          inputs[n as keyof typeof inputs].value
        ) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      zeroingInputs();
    } else {
      toasting('nothing to reset', 'info' as AlertColor);
    }
  };

  const handleStop = (evt: Event): void => {
    evt.preventDefault();
    setCut(true);
    const prev = snapshotInputs();

    let curr = snapshotInputs(unwrap(inputs), v => v?.value);
    dispatch('dots:cancelRequest', [prev, curr]);
    setTimeout(() => setCut(false), 0);
  };

  function snapshotInputs(
    ground: any = props.initialInputs(),
    mapfn?: (v: any) => any,
  ): Record<(typeof names)[number], any> {
    const ss = {} as Record<(typeof names)[number], any>;
    // TODO: structuredClone may throw
    const ii = structuredClone(ground);
    for (const k of Object.keys(ii)) {
      if (!names.includes(k)) {
        continue;
      }
      const v = ii[k as keyof typeof ground];
      ss[k] = mapfn ? mapfn(v) : v;
    }
    return ss;
  }

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
  async function sendRequest<T>(requestData: T) {
    if (requestData === undefined) {
      return;
    }

    // fire request
    const [remote, abort] = props.sendRequestFn(requestData);

    // closing while loading trigger request abortion
    const cancelRequest = () => {
      return submitForm.loading && (closing() || cut());
    };

    createEffect(() => {
      if (cancelRequest()) {
        abort();
      }
    });

    return await remote;
  }

  // submitting driven by signals
  const [startSubmit, setStartSubmit] = createSignal<T>();
  const [submitForm] = createResource(startSubmit, sendRequest);

  createComputed(() => {
    const v = closing();
    if (v) {
      zeroingInputs();
    }
    return v;
  });

  const onCloseAlertDialog = createEffect(() => {
    if (continueActionState.open) {
      return;
    }
    if (continueActionState.event?.type !== 'submit') {
      return;
    }

    if (continueActionState.choosing) {
      // submit
      handlngSubmit(continueActionState.event);
      untrack(() => {
        setContinueActionState('event', undefined);
      });
    }

    return continueActionState.event ?? undefined;
  });
  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    if (!continueActionState.open) {
      batch(() => {
        setContinueActionState('open', true);
        if (evt.type === 'submit') {
          setContinueActionState('event', evt);
        }
      });
    }
  };

  // vaidate and submit
  const handlngSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!event.target) return;
    if (event.target instanceof HTMLFormElement) {
      Array.from(event.target.elements)
        .filter((t: Element) => 'id' in t && names.includes(t.id))
        .map((t: unknown) => validateInputUpdateStore(t));
    } else {
      validateInputUpdateStore(event.target);
    }
    if (inputsHasErrors()) {
      return;
    }

    const requestData: T = collectFormData(
      event.target as HTMLFormElement,
      names,
    );
    let changed = false;
    let dontCheckChanged = true === names.includes('dontCheckChanged');
    if (dontCheckChanged) {
      changed = true;
    } else {
      for (const n of names) {
        // != ensure strings like numbers are equal with numbers
        if (
          props.initialInputs()[n as keyof typeof props.initialInputs] !=
          (requestData as any)[n]
        ) {
          changed = true;
          break;
        }
      }
    }

    if (!changed) {
      toasting(
        'unchanged data no not needed to be saved',
        'info' as AlertColor,
      );
      return;
    }

    setStartSubmit((prev: T | undefined) => requestData);
  };

  const [continueActionState, setContinueActionState] = createStore({
    open: false,
    choosing: false,
    event: undefined,
  } as AlertDialogState);

  const isDisabled = createMemo(() => {
    const v = submitForm.loading || !ui.ready;
    return v;
  });

  // utility to help form's inputs be controlled components
  const handleChange = (evtOrname: object | string, value: any) => {
    let name: string;
    if (typeof evtOrname === 'object') {
      if (!('target' in evtOrname && 'name' in (evtOrname.target as any))) {
        return;
      }
      name = (evtOrname.target as any)!.name;
    } else if (typeof evtOrname === 'string') {
      name = evtOrname;
    } else {
      // TODO maybe throw?
      return;
    }

    validateInputUpdateStore({ name, value });
  };

  createComputed(() => {
    const initial = props.initialInputs();
    if (initial !== undefined) {
      setInputs(makeValidable(initial));
    }
  });

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
        message = 'Action has been canceled by user';
      }
      toasting(message, severity);
    }
  });

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
        <Show when={submitForm.loading && ui.show.stop}>
          <ActionButton
            text="stop"
            only="text"
            type="button"
            color="error"
            size="small"
            onClick={handleStop}
            disabled={inputsHasErrors()}
          />
        </Show>
        <Show when={!submitForm.loading && ui.show.reset}>
          <ActionButton
            kind="reset"
            only="text"
            type="reset"
            color="error"
            size="small"
            disabled={isDisabled() || inputsHasErrors()}
          />
        </Show>
        <ActionButton
          disabled={isDisabled() || inputsHasErrors()}
          kind={props.textSave?.toLowerCase() as ActionButtonProps['kind']}
        />
      </Toolbar>
      <Divider />
    </AppBar>
  );

  const form: DialogProviderValue<any> = {
    setUI,
    inputs,
    setInputs,
    isDisabled,
    setValidation,
    submitForm,
    validateInputUpdateStore,
    setInitialInputs: props.setInitialInputs,
    handleChange,
  };

  return (
    <>
      <DialogContext.Provider value={form}>
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
            onReset={handleReset}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {appBar}
            <Suspense
              fallback={<CircularProgress size="3rem" sx={{ m: '5rem' }} />}
            >
              {props.children}
            </Suspense>
            <AlertDialog
              state={continueActionState}
              setState={setContinueActionState}
            />
          </Container>
        </Dialog>
      </DialogContext.Provider>
    </>
  );
};

export function useDialog() {
  return useContext(DialogContext);
}

export default DialogProvider;
