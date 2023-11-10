import { Container, TextField, useTheme, FormGroup } from '@suid/material';
import {
  createSignal,
  createResource,
  createEffect,
  onMount,
  onCleanup,
  Accessor,
  createComputed,
} from 'solid-js';
import type { JSX, Signal, ComponentProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import { AlertColor } from '@suid/material/Alert/AlertProps';

import type { EntryTypeData } from '@/pages/entry-types/types';
import { isEntryTypeData } from '@/pages/entry-types/types';
import { apiEntryType } from '@/api';
import type { MessagesMap, Validators, FieldNames } from '@/lib/form';
import { makeDefaults } from '@/lib/form';
import { required, minlen, maxlen, validate } from '@/lib/form';
import HelperTextMultiline from '@/components/HelperTextMultiline';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';
import { payload, zero } from '@/lib/api';
import InputOrSelect from './InputOrSelect';

const theme = useTheme();

export default function EntryTypeAdd(props: {
  closing: Accessor<boolean>;
  action: Signal<boolean>;
}): JSX.Element {
  // names of form inputs
  const names: string[] = ['code', 'description', 'unit'];
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

  // submit data
  async function postEntryTypeData(e: Event) {
    e.preventDefault();
    if (!e.target) return;

    // prepare data from DOM
    const data = Array.from(
      new FormData(e.target as HTMLFormElement).entries(),
    ).reduce(
      (
        acc: Record<string, FormDataEntryValue>,
        [k, v]: [string, FormDataEntryValue],
      ) => {
        acc[k] = v;
        return acc;
      },
      {} as Record<string, FormDataEntryValue>,
    );
    // to pure data
    const requestData = {
      id: 0,
      ...payload(data, names),
    } as EntryTypeData;
    // fire request
    const [remote, abort] = apiEntryType.add(requestData);

    // closing while loading trigger request abortion
    const cancelRequest = () => props.closing() && submitForm.loading;

    createEffect(() => {
      if (cancelRequest()) {
        abort();
      }
    });

    return await remote;
  }

  // action is responsability of the outer component
  const [action, setAction] = props!.action;

  // submitting driven by signals
  const [startSubmit, setStartSubmit] = createSignal<Event | null>();
  const [submitForm] = createResource(startSubmit, postEntryTypeData);

  createComputed(() => {
    const v = props.closing();
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
      setAction(false);
      return;
    }

    setStartSubmit(evt);
  };
  /*
  // bind submit event
  let formRef: HTMLFormElement | undefined;
  // set up handling the submit event
  onMount(() => formRef!.addEventListener('submit', handleSubmit));
  onCleanup(() => {
    formRef!.removeEventListener('submit', handleSubmit);
  });

  // when action() then DOM form submit
  // the above submit event trigger handleSubmit
  // which pinch reactive system through setStartSubmit(evt)
  // then postEntryTypeData(evt)
  // basically submiting stats from here way back up
  createEffect(() => {
    if (action() && !submitForm.loading) {
      try {
        formRef!.requestSubmit();
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  });
*/
  const isDisabled = () => submitForm.loading;

  createComputed(() => {
    submitForm.loading ? setLoading(true) : setAction(false);
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

  return (
    <Container
      sx={{
        padding: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        rowGap: theme.spacing(2),
      }}
    >
      <FormGroup
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          columnGap: theme.spacing(1),
        }}
      >
        <TextField
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ width: '10rem' }}
          value={inputs.code.value}
          error={inputs.code.error}
          helperText={<HelperTextMultiline lines={inputs.code.message} />}
          disabled={isDisabled()}
        />
        <TextField
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
          value={inputs.description.value}
          error={inputs.description.error}
          helperText={
            <HelperTextMultiline lines={inputs.description.message} />
          }
          disabled={isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        notifyStore={validateInputUpdateStore}
        unit={inputs.unit}
        disabled={isDisabled()}
      />
    </Container>
  );
}
