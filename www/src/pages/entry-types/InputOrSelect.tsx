import {
  FormControl,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormGroup,
  Button,
  Typography,
  useTheme,
} from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { Show, createSignal, createResource, For } from 'solid-js';
import ChangeCircleOutlinedIcon from '@suid/icons-material/ChangeCircleOutlined';

import { apiEntryType } from '@/api';
import { zero } from '@/lib/api';

const theme = useTheme();

// It is a component that can switch between a Select and a TextField
const InputOrSelect = (props: {
  unit: any;
  notifyStore: Function;
  disabled?: boolean;
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

  return (
    <FormGroup sx={{ width: '100%' }}>
      <Show when={!newUnit()}>
        <FormControl disabled={props.disabled}>
          <InputLabel shrink={props.unit?.value} id="unit-label">
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
            value={props.unit?.value}
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
            error={props.unit?.error}
          >
            <For each={units()}>
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

export default InputOrSelect;
