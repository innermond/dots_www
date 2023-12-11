import { Dialog, Slide, Container, CircularProgress } from '@suid/material';
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
  Suspense,
  onCleanup,
  createMemo,
  batch,
  untrack,
} from 'solid-js';
import {
  SetStoreFunction,
  Store,
  createStore,
  produce,
  unwrap,
} from 'solid-js/store';
import type { Accessor, Component, Resource, Setter } from 'solid-js';
import { AlertColor } from '@suid/material/Alert/AlertProps';

import type { InnerValidation, Validable } from '@/lib/form';
import { validate } from '@/lib/form';
import { makeValidable } from '@/lib/form';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';
import type { ActionButtonProps } from '@/components/ActionButton';
import { createContext } from 'solid-js';
import { dispatch } from '@/lib/customevent';
import AlertDialog, { AlertDialogState } from '@/components/AlertDialog';
import { ActionBarProps } from '@/components/ActionBar';
import ActionBar from '@/components/ActionBar';

const defaultTransition = function (
  props: TransitionProps & {
    children: JSX.Element;
  },
): JSX.Element {
  return <Slide direction="up" {...props} />;
};

export type DialogProviderValue<T extends {}> = {
  setUI: SetStoreFunction<DialogState>;
  setActionAlert: SetStoreFunction<AlertDialogState>;
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
  askMeBeforeAction?: boolean;
} & ParentProps;

type DialogState = {
  show: {
    reset: boolean;
    stop: boolean;
    action: boolean;
  };
  askMeBeforeAction: boolean;
  ready: boolean;
  sendRequestFn: Function;
};

const DialogContext = createContext();
// T is typeof data to be sent
const DialogProvider = <T extends {}>(props: DialogSaveProps<T>) => {
  onCleanup(() => {
    setLoading(false);
  });

  const initialState = {
    show: { reset: true, stop: !!props.allowStopRequest, action: true },
    askMeBeforeAction: !!props?.askMeBeforeAction,
    ready: false,
    sendRequestFn: props.sendRequestFn,
  } as DialogState;
  const [ui, setUI] = createStore(initialState);

  // open starts as undefined - means it has never been open
  const [open, setOpen] = props!.open;

  const closing = (): boolean => {
    const v = open();
    return !v;
  };

  createComputed(() => {
    const v = closing();
    if (v) {
      zeroingInputs();
    }
    return v;
  });

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
    const [remote, abort] = ui.sendRequestFn(requestData);

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

  createEffect(() => {
    if (actionAlert.open) {
      return;
    }
    if (actionAlert.event?.type !== 'submit') {
      return;
    }

    if (actionAlert.choosing) {
      // submit
      handlngSubmit(actionAlert.event);
      untrack(() => {
        setActionAlert('event', undefined);
      });
    }

    return actionAlert.event ?? undefined;
  });

  const handleClose = () => {
    if (submitForm.loading) {
      toasting('wait for operation to complete', 'warning');
      return;
    }
    setOpen(false);
  };

  const handleReset = (evt: Event): void => {
    evt.preventDefault();

    let changed = false;
    let dontCheckChanged = true === names.includes('dontCheckChanged');

    if (dontCheckChanged) {
      zeroingInputs();
      return;
    }

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

    if (!changed) {
      toasting('nothing to reset', 'info' as AlertColor);
      return;
    }

    zeroingInputs();
  };

  const handleStop = (evt: Event): void => {
    evt.preventDefault();
    setCut(true);

    const prev = snapshotInputs();
    let curr = snapshotInputs(unwrap(inputs), v => v?.value);
    dispatch('dots:cancelRequest', [prev, curr]);
    setTimeout(() => setCut(false), 0);
  };

  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (ui.askMeBeforeAction === false) {
      handlngSubmit(evt);
      return;
    }

    if (!actionAlert.open) {
      batch(() => {
        setActionAlert('open', true);
        if (evt.type === 'submit') {
          setActionAlert('event', evt);
        }
      });
    }
  };

  // vaidate and submit
  const handlngSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!event.target) return;
    let form: HTMLFormElement;
    if (event.target instanceof HTMLFormElement) {
      form = event.target;
      Array.from(event.target.elements)
        .filter((t: Element) => 'id' in t && names.includes(t.id))
        .map((t: unknown) => validateInputUpdateStore(t));
    } else {
      validateInputUpdateStore(event.target);
      if (!('form' in event.target)) {
        toasting('cannot find a form to send', 'error');
        return;
      }
      form = event.target.form as HTMLFormElement;
    }
    if (inputsHasErrors()) {
      return;
    }

    const requestData: T = collectFormData(form, names);
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

  const [actionAlert, setActionAlert] = createStore({
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

  type Bar = Pick<ActionBarProps, 'close' | 'reset' | 'stop' | 'act'>;
  const barInitial: Bar = {
    close: { show: true, disabled: false, color: 'inherit' },
    reset: {
      show: true,
      disabled: false,
      text: 'reset',
      color: 'error',
      kind: 'reset',
    },
    stop: {
      show: false,
      disabled: false,
      text: 'stop',
      color: 'error',
      kind: 'action',
    },
    act: {
      show: true,
      disabled: false,
      text: 'Do',
      color: 'inherit',
      kind: 'action',
    },
  };
  const [bar, setBar] = createStore(barInitial);

  createComputed(() => {
    if (submitForm.loading && ui.show.stop) {
      setBar('stop', 'show', true);
    } else {
      setBar('stop', 'show', false);
    }

    if (!submitForm.loading && ui.show.reset) {
      setBar('reset', 'show', true);
    } else {
      setBar('reset', 'show', false);
    }
  });
  createComputed(() => {
    if (inputsHasErrors()) {
      setBar('stop', 'disabled', true);
    } else {
      setBar('stop', 'disabled', false);
    }

    if (isDisabled() || inputsHasErrors()) {
      setBar(
        produce((b: Bar) => {
          b.reset.disabled = true;
          b.act.disabled = true;
        }),
      );
    } else {
      setBar(
        produce((b: Bar) => {
          b.reset.disabled = false;
          b.act.disabled = false;
        }),
      );
    }
  });
  createComputed(() => {
    if (ui.askMeBeforeAction) {
      setBar('act', 'color', 'error');
    } else {
      setBar('act', 'color', undefined);
    }

    if (props.textSave?.toLowerCase()) {
      setBar(
        produce((b: Bar) => {
          if (!props?.textSave) {
            return;
          }
          b.act.kind =
            props.textSave.toLowerCase() as ActionButtonProps['kind'];
          b.act.text = props.textSave;
        }),
      );
    }
  });

  const appBar = (
    <ActionBar
      title={props.title}
      onStop={handleStop}
      onClose={handleClose}
      close={bar.close}
      reset={bar.reset}
      stop={bar.stop}
      act={bar.act}
    />
  );

  const form: DialogProviderValue<any> = {
    setUI,
    setActionAlert,
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
          onClose={handleClose}
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
            <AlertDialog state={actionAlert} setState={setActionAlert} />
          </Container>
        </Dialog>
      </DialogContext.Provider>
    </>
  );
};

export function useDialog() {
  return useContext(DialogContext);
}

export type { DialogState };
export default DialogProvider;
