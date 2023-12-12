import { Dialog, Slide, Container, CircularProgress } from '@suid/material';
import { TransitionProps } from '@suid/material/transitions';
import {
  JSX,
  ParentProps,
  createSignal,
  createResource,
  createComputed,
  createEffect,
  Suspense,
  onCleanup,
  batch,
  untrack,
} from 'solid-js';
import { createStore, produce, unwrap } from 'solid-js/store';
import type { Component } from 'solid-js';
import { AlertColor } from '@suid/material/Alert/AlertProps';

import type { MessagesMap, Validators } from '@/lib/form';
import { makeValidable } from '@/lib/form';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';
import type { ActionButtonProps } from '@/components/ActionButton';
import { dispatch } from '@/lib/customevent';
import AlertDialog, { AlertDialogState } from '@/components/AlertDialog';
import { ActionBarProps } from '@/components/ActionBar';
import ActionBar from '@/components/ActionBar';
import {
  ActionFormContextState,
  ActionFormContextValue,
  useActionForm,
} from '@/contexts/ActionFormContext';

export type ActionFormProps<T> = {
  title: string;
  textSave?: string;
  transition?: Component<TransitionProps & { children: JSX.Element }>;
  names: string[];
  actionFn: Function;
  initialInputs: T;
  validators: Validators<keyof T extends string ? string : never>;
  messages: MessagesMap<keyof T extends string ? string : never>;
  allowStopRequest?: boolean;
  askMeBeforeAction?: boolean;
};

// T is typeof data to be sent
const ActionForm = <T extends {}>(props: ParentProps<ActionFormProps<T>>) => {
  const actionFn = props.actionFn;

  const {
    actionFormState: state,
    setActionFormContextState: setState,
    validateInputUpdateStore,
  } = useActionForm() as ActionFormContextValue<T>;

  const defaultTransition = function (
    props: TransitionProps & {
      children: JSX.Element;
    },
  ): JSX.Element {
    return <Slide direction="up" in={state.open} {...props} />;
  };

  const names = props.names;
  type Names = (typeof names)[number];

  // it reset inputs when closing
  createComputed(() => {
    if (state.open) {
      return;
    }
    zeroingInputs();
  });

  // spread defaultInputs as being a store means it is modified
  // by operations done over store
  // and defaultInputs will unexpectedly by changed
  const inputsHasErrors = () => {
    for (const name of names) {
      if (name in state.inputs && state.inputs[name as keyof T].error) {
        return true;
      }
    }
    return false;
  };
  const zeroingInputs = () => {
    const initial = props.initialInputs;
    const init = makeValidable(initial, ...names);
    setState('inputs', init);
  };
  function snapshotInputs(
    ground: any = props.initialInputs,
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
    const [remote, abort] = actionFn(requestData);

    // closing while loading trigger request abortion
    const cancelRequest = () => {
      return submitForm.loading && (!state.open || state.cut);
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

  const handleClose = (evt: Event) => {
    if (submitForm.loading) {
      toasting('wait for operation to complete', 'warning');
      return;
    }
    dispatch('dots:close:ActionForm');
    setState('open', false);
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
        props.initialInputs[n as keyof typeof props.initialInputs] !=
        state.inputs[n as keyof typeof state.inputs].value
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
    setState('cut', true);

    const prev = snapshotInputs();
    let curr = snapshotInputs(unwrap(state.inputs), v => v?.value);
    dispatch('dots:cancelRequest', [prev, curr]);
    setTimeout(() => setState('cut', false), 0);
  };

  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (state.askMeBeforeAction === false) {
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
          props.initialInputs[n as keyof typeof props.initialInputs] !=
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

  createComputed(() => {
    if (!state.ready) {
      return;
    }
    // overwrite
    setState(
      produce((s: ActionFormContextState<T>) => {
        // before submit or after successfully submit
        s.ready = ['unresolved', 'ready'].includes(submitForm.state);
        s.result = submitForm();
      }),
    );
  });

  createComputed(() => {
    const initial = props.initialInputs;
    if (initial === undefined) {
      return;
    }
    setState('inputs', makeValidable(initial));
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
      setState('result', submitForm());
      setState('ready', true);
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
    if (submitForm.loading && state.show.stop) {
      setBar('stop', 'show', true);
    } else {
      setBar('stop', 'show', false);
    }

    if (!submitForm.loading && state.show.reset) {
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

    if (!state.ready || inputsHasErrors()) {
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
    if (state.askMeBeforeAction) {
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

  onCleanup(() => {
    setLoading(false);
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

  return (
    <Dialog
      fullWidth
      sx={{ alignItems: 'center' }}
      open={state.open ?? false}
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
  );
};

export default ActionForm;
