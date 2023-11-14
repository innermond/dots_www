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
  FormHelperText,
} from '@suid/material';
import { Show, createSignal, createResource, For, Accessor } from 'solid-js';
import ChangeCircleOutlinedIcon from '@suid/icons-material/ChangeCircleOutlined';

import { apiEntryType } from '@/api';
import { SelectChangeEvent } from '@suid/material/Select';
import { Validation } from '@/lib/form';
import HelperTextMultiline from '@/components/HelperTextMultiline';

const theme = useTheme();

// It is a component that can switch between a Select and a TextField
const InputOrSelect = (props: {
  unit: Validation;
  setUnit: Setter<string>;
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

  const unit = props.unit.value;

  const handleSelectChange = (evt: SelectChangeEvent) => {
    setIsOpen(false);
    props.setUnit(evt.target.value);
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
        <FormControl error={props.unit.error} disabled={props.disabled}>
          <InputLabel shrink={!!props.unit.value} id="unit-label">
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
            renderValue={(v: any) => v}
            value={props.unit.value}
            defaultValue={unit}
            onChange={handleSelectChange}
            onClick={(evt: MouseEvent) => {
              if (props.disabled) {
                return;
              }

              const id = (evt.target as HTMLElement)?.id;
              const inside = id === 'unit-wrapper';
              setIsOpen(inside);
            }}
            open={isOpen()}
            error={props.unit.error}
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
          <Show when={props.unit.error}>
            <HelperTextMultiline lines={props.unit.message} />
          </Show>
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
          error={props.unit.error}
          helperText={<HelperTextMultiline lines={props.unit.message} />}
          disabled={props.disabled}
        />
        {switchNewUnit('or use existent unit', false)}
      </Show>
    </FormGroup>
  );
};

export default InputOrSelect;
