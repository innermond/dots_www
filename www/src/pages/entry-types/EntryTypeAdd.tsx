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
} from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import {
  Show,
  createSignal,
  createResource,
  createEffect,
  onMount,
  onCleanup,
} from 'solid-js';
import type { JSX, Signal } from 'solid-js';
import ChangeCircleOutlinedIcon from '@suid/icons-material/ChangeCircleOutlined';

import { entryType } from '@/lib/api';

async function postEntryTypeData(e: Event) {
  e.preventDefault();
  const data = new FormData(e.target as HTMLFormElement).entries();
  const result: Record<string, string> = {};
  for (const [k, v] of data) {
    result[k] = v as string;
  }
  const { code, description, unit } = result;
  const requestData = { id: 0, code, description, unit };
  return entryType.add(requestData);
}

const theme = useTheme();

export default function EntryTypeAdd(props: {
  action: Signal<boolean>;
}): JSX.Element {
  const [startSubmit, setStartSubmit] = createSignal<Event | null>();
  const [submitForm] = createResource(startSubmit, postEntryTypeData);

  const [action, setAction] = props!.action;

  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();
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
  });
  return (
    <Container
      ref={formRef}
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
          required
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ width: '10rem' }}
        />
        <TextField
          required
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
        />
      </FormGroup>
      <UnitSelect />
    </Container>
  );
}

const UnitSelect = () => {
  const [selected, setSelected] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [newUnit, setNewUnit] = createSignal(false);
  const [newUnitValue, setNewUnitValue] = createSignal('');

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

  return (
    <FormGroup sx={{ width: '100%' }}>
      <Show when={!newUnit()}>
        <FormControl>
          <InputLabel id="unit-label">Unit</InputLabel>
          <Select
            labelId="unit-label"
            label="Unit"
            id="unit"
            name="unit"
            value={selected()}
            onChange={handleChange}
            onClick={(evt: MouseEvent) => {
              setIsOpen(() => {
                const id = (evt.target as HTMLElement)?.id;
                return id === 'unit';
              });
            }}
            open={isOpen()}
          >
            <MenuItem value={10}>buc</MenuItem>
            <MenuItem value={20}>piece</MenuItem>
            <MenuItem value={30}>hour</MenuItem>
          </Select>
        </FormControl>
        {switchSelect('or add a new unit', true)}
      </Show>
      <Show when={newUnit()}>
        <TextField
          focused
          inputRef={input => setTimeout(() => input.focus())}
          required
          name="unit"
          label="Unit"
          type="text"
          id="unit"
          autoComplete="off"
          onChange={handleNewUnitChange}
          value={newUnitValue()}
        />
        {switchSelect('or use existent unit', false)}
      </Show>
    </FormGroup>
  );
};
