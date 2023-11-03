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
import { JSX, Show, createSignal, createEffect } from 'solid-js';
import ChangeCircleOutlinedIcon from '@suid/icons-material/ChangeCircleOutlined';

const theme = useTheme();

export default function EntryTypeAdd(props: any): JSX.Element {
  return (
    <Container
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

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
    setIsOpen(false);
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
            id="unit-select"
            value={selected()}
            onChange={handleChange}
            onClick={(evt: MouseEvent) => {
              setIsOpen(() => {
                const id = (evt.target as HTMLElement)?.id;
                return id === 'unit-select';
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
          autoFocus={newUnit()}
          focused={newUnit()}
          inputRef={input => setTimeout(() => input.focus())}
          required
          name="unit"
          label="Unit"
          type="text"
          id="unit"
          autoComplete="off"
        />
        {switchSelect('or use existent unit', false)}
      </Show>
    </FormGroup>
  );
};
