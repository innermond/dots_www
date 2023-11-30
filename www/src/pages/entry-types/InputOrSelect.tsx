import {
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormGroup,
  Button,
  Typography,
  useTheme,
} from '@suid/material';
import { Show, createSignal, For } from 'solid-js';
import ChangeCircleOutlinedIcon from '@suid/icons-material/ChangeCircleOutlined';

import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import { SelectChangeEvent } from '@suid/material/Select';
import { Validation } from '@/lib/form';
import { FormHelperText } from '@suid/material';

const theme = useTheme();
export type InputOrSelectOption = { value: string; label: string };
type InputOrSelectProps = {
  unit: Validation<string>;
  units: Array<InputOrSelectOption>;
  setUnit: (u: string | null) => void;
  disabled?: boolean;
};
// It is a component that can switch between a Select and a TextField
const InputOrSelect = <T extends {}>(props: InputOrSelectProps) => {
  // open/close Select
  const [isOpen, setIsOpen] = createSignal(false);
  // switch to Text
  const [newUnit, setNewUnit] = createSignal(false);

  const unitValueDefault = props.unit.value;

  const handleSelectChange = (evt: SelectChangeEvent) => {
    setIsOpen(false);
    props.setUnit(evt.target.value);
  };

  const handleClick = (evt: MouseEvent) => {
    if (props.disabled) {
      return;
    }

    const id = (evt.target as HTMLElement)?.id;
    const inside = id === 'unit-wrapper';
    setIsOpen(inside);
    // force unfocus of internal input after clicking away
    // to make label looks right
    if (!inside) {
      (document.activeElement as HTMLInputElement)?.blur();
    }
  };

  const switchNewUnit = (txt: string, openNewUnit: boolean) => {
    const color = theme.palette.text.secondary;
    return (
      <Button
        endIcon={<ChangeCircleOutlinedIcon color="action" />}
        sx={{ alignSelf: 'flex-end' }}
        onClick={() => {
          if (props.disabled) {
            return;
          }

          setNewUnit(openNewUnit);
          setIsOpen(!openNewUnit);
          if (openNewUnit) {
            props.setUnit('');
          }
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
        <FormControl
          sx={{ maxWidth: '100%' }}
          error={props.unit.error}
          disabled={props.disabled}
        >
          <InputLabel shrink={!!props.unit.value} for="unit" id="unit-label">
            Unit
          </InputLabel>
          <Select
            labelId="unit-label"
            label="Unit"
            id="unit-wrapper"
            name="unit"
            inputProps={{
              id: 'unit',
              style: { overflow: 'hidden', 'text-overflow': 'ellipsis' },
            }}
            renderValue={(v: any) => v}
            value={props.unit.value}
            defaultValue={unitValueDefault}
            onChange={handleSelectChange}
            onClick={handleClick}
            open={isOpen()}
            error={props.unit.error}
          >
            <For each={props.units}>
              {(u: InputOrSelectOption) => {
                return <MenuItem value={u.value}>{u.label}</MenuItem>;
              }}
            </For>
          </Select>
          <Show when={props.unit.error}>
            <FormHelperText error={props.unit.error}>
              {props.unit.message}
            </FormHelperText>
          </Show>
        </FormControl>
        {switchNewUnit('or add a new unit', true)}
      </Show>
      <Show when={newUnit()}>
        <TextFieldEllipsis
          inputRef={input => setTimeout(() => input.focus())}
          InputLabelProps={{ shrink: !!props.unit.value }}
          name="unit"
          label="Unit"
          type="text"
          id="unit"
          autoComplete="off"
          error={props.unit.error}
          helperText={props.unit.message}
          disabled={props.disabled}
          value={props.unit.value}
          defaultValue={unitValueDefault}
          onChange={(evt: Event) => {
            props.setUnit((evt.target as HTMLInputElement).value);
          }}
        />
        {switchNewUnit('or use existent unit', false)}
      </Show>
    </FormGroup>
  );
};

export default InputOrSelect;
