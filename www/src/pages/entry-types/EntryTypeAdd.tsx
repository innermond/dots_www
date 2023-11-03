import {
  Container,
  FormControl,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormGroup,
} from '@suid/material';
import { SelectChangeEvent } from '@suid/material/Select';
import { JSX, createSignal } from 'solid-js';

export default function EntryTypeAdd(props: any): JSX.Element {
  return (
    <Container sx={{display: 'flex', alignItems:'center'}}>
        <TextField
          margin="normal"
          required
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
        />
        <TextField
          margin="normal"
          required
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
        />
        <FormControl margin="normal" sx={{ width: '10rem' }}>
          <UnitSelect />
        </FormControl>
    </Container>
  );
}

const UnitSelect = () => {
  const [selected, setSelected] = createSignal('');

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };
  return (
    <>
      <InputLabel id="unit-label">Unit</InputLabel>
      <Select
        labelId="unit-label"
        label="Unit"
        id="unit-select"
        value={selected()}
        onChange={handleChange}
      >
        <MenuItem value={10}>buc</MenuItem>
        <MenuItem value={20}>piece</MenuItem>
        <MenuItem value={30}>hour</MenuItem>
      </Select>
    </>
  );
};
