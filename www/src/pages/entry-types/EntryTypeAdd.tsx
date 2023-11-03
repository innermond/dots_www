import {
  Container,
  FormControl,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  useTheme,
  FormGroup,
  Typography,
  Button,
} from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { JSX, Show, createSignal } from 'solid-js';

const theme = useTheme();

export default function EntryTypeAdd(props: any): JSX.Element {
  return (
    <Container component="form" sx={{padding: theme.spacing(3), display: 'flex', alignItems:'center', flexDirection: 'column', rowGap: theme.spacing(2)}}>
    <FormGroup sx={{width: '100%', display: 'flex', flexDirection: 'row', columnGap: theme.spacing(1)}}>
        <TextField
          required
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{width: '10rem'}}
        />
        <TextField
          required
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{flex: 1}}
        />
    </FormGroup>
        <UnitSelect />
    </Container>
  );
}

const UnitSelect = () => {
  const [selected, setSelected] = createSignal('');
  const [newUnit, setNewUnit] = createSignal(false);

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };
  return (
    <FormGroup sx={{width: '100%'}}>
      <Show when={!newUnit()}>
        <FormControl>
          <InputLabel id="unit-label">Unit</InputLabel>
          <Select
            labelId="unit-label"
            label="Unit"
            id="unit-select"
            value={selected()}
            onChange={handleChange}
            defaultOpen={true}
          >
            <MenuItem value={10}>buc</MenuItem>
            <MenuItem value={20}>piece</MenuItem>
            <MenuItem value={30}>hour</MenuItem>
          </Select>
        </FormControl>
        <Button onClick={()=>setNewUnit(true)}>or add new unit</Button>
      </Show>
      <Show when={newUnit()}>
        <TextField />
        <Button onClick={()=>setNewUnit(false)}>or use existent unit</Button>
      </Show>
    </FormGroup>
  );
};
