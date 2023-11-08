import {
  Container,
  FormControl,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  useTheme,
  FormGroup,
  Button,
  Typography,
  Alert,
} from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import {
  Show,
  createSignal,
  createResource,
  createEffect,
  onMount,
  onCleanup,
  For,
  Accessor,
  createMemo,
} from 'solid-js';
import type { JSX, Signal } from 'solid-js';
import ChangeCircleOutlinedIcon from '@suid/icons-material/ChangeCircleOutlined';
import { toast } from 'solid-toast';
import { AlertColor } from '@suid/material/Alert/AlertProps';
import type { EntryTypeData } from '@/pages/entry-types/types';
import { isEntryTypeData } from '@/pages/entry-types/types';

import { apiEntryType } from '@/api';
import { createStore } from 'solid-js/store';
import type { MessagesMap, Validable, Validators } from '@/lib/form';
import { required, minlen, maxlen, validate } from '@/lib/form';
import HelperTextMultiline from '@/components/HelperTextMultiline';
import { setLoading } from '@/components/Loading';
import { useNavigate } from '@solidjs/router';
import toasting from '@/lib/toast';

function payload<T>(obj: T, filterList: string[]): Partial<T> {
  const isObject = typeof obj === 'object' && obj !== null;
  if (!isObject) return {};

  const out: Partial<T> = Object.keys(obj).reduce((acc, k) => {
    if (filterList.includes(k) && k in obj) {
      acc[k as keyof T] = obj[k as keyof T];
    }
    return acc;
  }, {} as Partial<T>);

  return out;
}

const makeDefaults = (...names: string[]) => {
  const defaults = {} as Validable<(typeof names)[number]>;
  let n: string;
  for (n of names) {
    // use value: null because undefined will make component uncontrolled
    defaults[n] = { value: null, error: false, message: [] };
  }

  return defaults;
};

type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type FieldNames<T extends string[]> = T[number];

const theme = useTheme();

const zero = (undef: boolean = false) => ({
  value: undef ? null : '',
  error: false,
  message: [],
});

export default function EntryTypeAdd(props: {
  closing: Accessor<boolean>;
  action: Signal<boolean>;
}): JSX.Element {
  const names: string[] = ['code', 'description', 'unit'];
  type Names = FieldNames<typeof names>;

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

  const validators: Validators<Names> = {
    code: [required, minlen(7), maxlen(50)],
    description: [required, minlen(7), maxlen(100)],
    unit: [required, minlen(2), maxlen(20)],
  };

  const textmessages = [
    (f: string) => `${f} is required`,
    (f: string, v: string, { len }: { len: number }) =>
      `${f} must be more than ${len} - has ${v.length}`,
    (f: string, v: string, { len }: { len: number }) =>
      `${f} must be less than ${len} - has ${v.length}`,
  ];

  const messages: MessagesMap<Names> = {
    code: textmessages,
    description: textmessages,
    unit: textmessages,
  };

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

  createEffect(() => {
    if (!reset()) return;

    setInputs({ code: zero(), description: zero(), unit: zero(true) });
  });

  function handleInput(e: Event) {
    e.preventDefault();
    if (!e.target) return;
    if (e.target instanceof HTMLFormElement) {
      Array.from(e.target.elements)
        .filter((t: Element) => 'id' in t && names.includes(t.id))
        .map((t: unknown) => validateInputUpdateStore(t));
      return;
    }
    validateInputUpdateStore(e.target);
  }

  async function postEntryTypeData(e: Event) {
    e.preventDefault();
    if (!e.target) return;

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
    const requestData = {
      id: 0,
      ...payload(data, ['code', 'description', 'unit']),
    } as EntryTypeData;
    const [remote, abort] = apiEntryType.add(requestData);
    createEffect(() => props.closing() && abort());
    return await remote;
  }
  // action is responsability of the outer component
  const [action, setAction] = props!.action;

  const [startSubmit, setStartSubmit] = createSignal<Event | null>();
  const [submitForm] = createResource(startSubmit, postEntryTypeData);

  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();

    handleInput(evt);
    if (inputsHasErrors()) {
      setAction(false);
      return;
    }

    setStartSubmit(evt);
  };
  let formRef: HTMLFormElement | undefined;
  onMount(() => formRef!.addEventListener('submit', handleSubmit));
  onCleanup(() => {
    formRef!.removeEventListener('submit', handleSubmit);
  });
  createEffect(() => {
    if (action() && !submitForm.loading) {
      formRef!.requestSubmit();
    }
  });

  const isDisabled = () => submitForm.loading;

  createEffect(() => {
    if (submitForm.loading) {
      toast.dismiss();
      setLoading(true);
    } else {
      // TODO this is a MUST in order to be able to request again
      setAction(false);
    }
  });

  const navigate = useNavigate();
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
      const { code, unit } = result as EntryTypeData;
      setLoading(false);
      toasting(`added entry type "${code}" / unit "${unit}"`);

      setInputs({ code: zero(), description: zero(), unit: zero(true) });
      setReset(true);
    }
  });

  createEffect(() => {
    if (submitForm.error) {
      const data = submitForm.error;
      let severity = 'error';
      let message =
        data?.message ??
        data?.error ??
        data?.cause?.error ??
        'An error occured';
      if (props.closing() || data?.name === 'AbortError') {
        message = data.message;
        severity = 'info';
      }
      const alert = <Alert severity={severity as AlertColor}>{message}</Alert>;
      toast.custom(() => alert, {
        duration: 6000,
        unmountDelay: 0,
      });
      setLoading(false);
    }
  });

  const [reset, setReset] = createSignal(false);

  return (
    <Container
      ref={formRef}
      novalidate
      autocomplete="off"
      component="form"
      onInput={handleInput}
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
      <UnitSelect
        reset={reset}
        notifyStore={validateInputUpdateStore}
        unit={inputs.unit}
        disabled={isDisabled()}
      />
    </Container>
  );
}

// It is a component that can switch between a Select and a TextField
const UnitSelect = (props: {
  unit: any;
  reset: Accessor<boolean>;
  notifyStore: Function;
  disabled: boolean;
}) => {
  // open/close Select
  const [isOpen, setIsOpen] = createSignal(false);
  // switch to Text
  const [newUnit, setNewUnit] = createSignal(false);

  // list of units
  const [unitsResource] = createResource(apiEntryType.units);
  const units = (): (string | Error)[] => {
    const info = unitsResource();
    if (info instanceof Error || !info) {
      return [];
    }

    const { data, n } = info as any;
    return n ? data : [];
  };

  const handleSelectChange = (evt: SelectChangeEvent) => {
    // trigger onInput
    props.notifyStore({ name: 'unit', value: evt.target.value });
    setIsOpen(false);
  };

  const handleNewUnitChange = (evt: Event) => {
    props.notifyStore({ name: 'unit', value: (evt.target as any)?.value });
  };

  const switchNewUnit = (txt: string, openNewUnit: boolean) => {
    const color = theme.palette.text.secondary;
    return (
      <Button
        endIcon={<ChangeCircleOutlinedIcon color="action" />}
        sx={{ width: 'fit-content', alignSelf: 'flex-end' }}
        onClick={() => {
          if (props.disabled) {
            return;
          }

          props.notifyStore({ name: 'unit', value: '' }, true);
          setNewUnit(openNewUnit);
          setIsOpen(!openNewUnit);
        }}
        disabled={props.disabled}
      >
        <Typography sx={{ textTransform: 'lowercase', color }}>
          {txt}
        </Typography>
      </Button>
    );
  };

  const items = createMemo(() => units());
  return (
    <FormGroup sx={{ width: '100%' }}>
      <Show when={!newUnit()}>
        <FormControl disabled={props.disabled}>
          <InputLabel shrink={props.unit.value} id="unit-label">
            Unit
          </InputLabel>
          <Select
            labelId="unit-label"
            label="Unit"
            id="unit-wrapper"
            name="unit"
            inputProps={{
              id: 'unit',
            }}
            defaultValue={''}
            value={props.unit.value}
            onChange={handleSelectChange}
            onClick={(evt: MouseEvent) => {
              if (props.disabled) {
                return;
              }

              const id = (evt.target as HTMLElement)?.id;
              const inside = id === 'unit-wrapper';
              setIsOpen(() => inside);
              if (!inside) {
                setTimeout(props.notifyStore({ unit: zero(true) }));
              }
            }}
            open={isOpen()}
            error={props.unit.error}
          >
            <For each={items()}>
              {(u: string | Error) => {
                if (u instanceof Error) {
                  return <MenuItem value={u.message}>{u.message}</MenuItem>;
                }
                return <MenuItem value={u}>{u}</MenuItem>;
              }}
            </For>
          </Select>
        </FormControl>
        {switchNewUnit('or add a new unit', true)}
      </Show>
      <Show when={newUnit()}>
        <TextField
          inputRef={input => setTimeout(() => input.focus())}
          name="unit"
          label="Unit"
          type="text"
          id="unit"
          autoComplete="off"
          onChange={handleNewUnitChange}
          value={props.unit.value}
          error={props.unit.error}
          helperText={props.unit.message}
          disabled={props.disabled}
        />
        {switchNewUnit('or use existent unit', false)}
      </Show>
    </FormGroup>
  );
};
