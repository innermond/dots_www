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
import type {EntryTypeData} from '@/pages/entry-types/types';
import {isEntryTypeData} from '@/pages/entry-types/types';

import { apiEntryType } from '@/api';
import {createStore} from 'solid-js/store';
import type {MessagesMap, Validable, Validators} from '@/lib/form';
import {
  required,
  minlen,
  maxlen,
  validate,
} from '@/lib/form';
import HelperTextMultiline from '@/components/HelperTextMultiline';
import { setLoading } from '@/components/Loading';
import {useNavigate} from '@solidjs/router';
import toasting from '@/lib/toast';

async function postEntryTypeData(e: Event) {
  e.preventDefault();
  const data = new FormData(e.target as HTMLFormElement).entries();
  const result: Record<string, string> = {};
  for (const [k, v] of data) {
    result[k] = v as string;
  }
  const { code, description, unit } = result;
  const requestData = { id: 0, code, description, unit };
  return apiEntryType.add(requestData);
}

const makeDefaults = (...names: string[]) => {
  const defaults = {} as Validable<typeof names[number]>;
  let n: string;
  for (n of names) {
    defaults[n] = {value: undefined, error: false, message: []}
  }

  return defaults;
};

const types = [
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLSelectElement,
  //HTMLButtonElement,
  //HTMLFieldSetElement,
  //HTMLLegendElement,
  //HTMLLabelElement,
];
type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type FieldNames<T extends string[]> = T[number];

function isInstanceOf<T>(elem: unknown): elem is T {
  return types.some((t: Function) => (elem instanceof t));
}

const theme = useTheme();

export default function EntryTypeAdd(props: {
  action: Signal<boolean>;
}): JSX.Element {

  const names : string[] = ['code', 'description', 'unit']; 
  type Names = FieldNames<typeof names>;

  const zero = {
    value: undefined,
    error: false,
    message: [],
  };

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
    code: [required,  minlen(7), maxlen(50)],
    description: [required,  minlen(7), maxlen(100)],
    unit: [required,  minlen(2), maxlen(20)],
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

  const validateInputUpdateStore = (target: unknown): void => {
    if (!isInstanceOf<FormControl>(target)) return;

    const { name, value } = target as FormControl;
    if (!names.includes(name)) return;

    const multierrors: string[] = validate<Names>(
      name,
      value,
      validators,
      messages,
    );
    setInputs(name as Names, () => {
      return { value,  error: multierrors.length > 0, message: multierrors };
    });
  }

  createEffect(() => {
    if (!reset()) return;

    setInputs({ code: zero, description: zero, unit: zero });
  });

  function handleInput(e: Event) {
    e.preventDefault();
    if (!e.target) return;
    if (e.target instanceof HTMLFormElement) {
      Array.from(e.target.elements)
        .filter((t: Element) => (('id' in t) && names.includes(t.id)))
        .map((t: unknown) => validateInputUpdateStore(t)); 
      return;
    } 
    validateInputUpdateStore(e.target);
  }

  const [startSubmit, setStartSubmit] = createSignal<Event | null>();
  const [submitForm] = createResource(startSubmit, postEntryTypeData);

  const [action, setAction] = props!.action;

  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();

    handleInput(evt);
    if (inputsHasErrors()) {
      setAction(false);
      return;
    }
    setStartSubmit(evt);
    // TODO this is a MUST in order to be able to request again
    setAction(false);
  };
  let formRef: HTMLFormElement | undefined;
  onMount(() => formRef!.addEventListener('submit', handleSubmit));
  onCleanup(() => {
    formRef!.removeEventListener('submit', handleSubmit);
  });
  createEffect(() => {
    if (action()) {
      formRef!.requestSubmit();
    }
  })
 
  createEffect(() => {
    if (submitForm.loading) {
      toast.dismiss();
      setLoading(true);
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
      const {code, unit} = (result as EntryTypeData);
      setLoading(false);
      toasting(`added entry type "${code}" / unit "${unit}"`);

      setInputs({ code: zero, description: zero, unit: zero });

      /*for (const elem of Array.from(formRef!.elements).filter((e: Element) => names.includes(e['id']))) {
        if (isInstanceOf<FormControl>(elem)) {
          (elem as FormControl).value = '';
        }
      }*/
      setReset(true);
}});

  createEffect(() => {
    if (submitForm.error) {
      const data = submitForm.error;
      const message = data?.error ?? data?.cause?.error ?? 'An error occured';
      toast.custom(() => <Alert severity="error">{message}</Alert>, {
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
      component="form"
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
          onInput={handleInput}
          defaultValue={''}
          value={inputs.code.value}
          error={inputs.code.error}
          helperText={<HelperTextMultiline lines={inputs.code.message} />}
        />
        <TextField
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
          onInput={handleInput}
          defaultValue={''}
          value={inputs.description.value}
          error={inputs.description.error}
          helperText={<HelperTextMultiline lines={inputs.description.message} />}
        />
      </FormGroup>
      <UnitSelect reset={reset} validated={inputs.unit} />
    </Container>
  )
}

const UnitSelect = (props: {validated: any, reset: Accessor<boolean>}) => {
  const [selected, setSelected] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [newUnit, setNewUnit] = createSignal(false);
  const [newUnitValue, setNewUnitValue] = createSignal('');

  const [unitsResource] = createResource(apiEntryType.units);
  const units = (): (string|Error)[] => {
    const info = unitsResource();
    if (info instanceof Error || !info) {
      return [];
    }

    const { data, n } = info as any;
    return n ? data : [];
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
    setIsOpen(false);
  };

  const handleNewUnitChange = (evt: Event) => {
    setNewUnit(true);
    setNewUnitValue((evt.target as HTMLInputElement)?.value);
  };

  const switchSelect = (txt: string, willOpen: boolean) => {
    const color = theme.palette.text.secondary;
    return (
      <Button
        endIcon={<ChangeCircleOutlinedIcon color="action" />}
        sx={{ width: 'fit-content', alignSelf: 'flex-end' }}
        onClick={() => {
          setNewUnit(willOpen);
          if (willOpen) {
            setIsOpen(true);
          }
        }}
      >
        <Typography sx={{ textTransform: 'lowercase', color }}>
          {txt}
        </Typography>
      </Button>
    );
  };

  const selectValue = () => {
    if (selected()) return selected();
    if (props.reset()) return '';
  };

  const items = createMemo(() => units());
  return (
    <FormGroup sx={{ width: '100%' }}>
      <Show when={!newUnit()}>
        <FormControl>
          <InputLabel id="unit-label">Unit</InputLabel>
          <Select
            labelId="unit-label"
            label="Unit"
            id="unit-wrapper"
            name="unit"
            inputProps={{
              id: 'unit',
            }}
            defaultValue={''}
            value={props.validated.value}
            onChange={handleChange}
            onClick={(evt: MouseEvent) => {
              setIsOpen(() => {
                const id = (evt.target as HTMLElement)?.id;
                return id === 'unit-wrapper';
              });
            }}
            open={isOpen()}
            error={props.validated.error}
          >
            <For each={items()}>
              {(u: string|Error) => {
                if (u instanceof Error) {
                  return (<MenuItem value={u.message}>{u.message}</MenuItem>)
                }  
                return (<MenuItem value={u}>{u}</MenuItem>)
                }
              }
            </For>
          </Select>
        </FormControl>
        {switchSelect('or add a new unit', true)}
      </Show>
      <Show when={newUnit()}>
        <TextField
          focused
          inputRef={input => setTimeout(() => input.focus())}
          name="unit"
          label="Unit"
          type="text"
          id="unit"
          autoComplete="off"
          onChange={handleNewUnitChange}
          value={newUnitValue()}
          error={props.validated.error}
          helperText={props.validated.message}
        />
        {switchSelect('or use existent unit', false)}
      </Show>
    </FormGroup>
  );
};
