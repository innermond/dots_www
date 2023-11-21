import { Container, useTheme, FormGroup } from '@suid/material';
import { JSX, createEffect } from 'solid-js';
import InputOrSelect from './InputOrSelect';
import {
  isEntryTypeData,
  isKeyofEntryTypeData,
} from '@/pages/entry-types/types';
import type { EntryTypeData } from '@/pages/entry-types/types';
import { produce } from 'solid-js/store';
import type {
  FieldNames,
  MessagesMap,
  Validators,
  Validation,
} from '@/lib/form';
import { required, minlen, maxlen } from '@/lib/form';
import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import toasting from '@/lib/toast';
import { DialogProviderValue, useDialog } from '@/contexts/DialogContext';

const theme = useTheme();
const names = ['code', 'description', 'unit'];
type Names = FieldNames<typeof names>;

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

export default function EntryTypeAdd(): JSX.Element {
  const { inputs, setInputs, isDisabled, setValidation, submitForm } =
    useDialog() as DialogProviderValue<EntryTypeData>;

  setValidation({ validators, messages });

  const handleInput = (e: InputEvent) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    if (!name || value === undefined || !isKeyofEntryTypeData(name)) {
      return;
    }

    setInputs(
      name as keyof EntryTypeData,
      { value, error: false, message: '' } as Validation<typeof value>,
    );
  };

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been added`);
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
        <TextFieldEllipsis
          InputLabelProps={{ shrink: !!inputs.code.value }}
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ width: '10rem' }}
          onInput={handleInput}
          error={inputs.code.error}
          helperText={inputs.code.message}
          disabled={isDisabled()}
        />
        <TextFieldEllipsis
          InputLabelProps={{ shrink: !!inputs.description.value }}
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
          onInput={handleInput}
          error={inputs.description.error}
          helperText={inputs.description.message}
          disabled={isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        unit={inputs.unit}
        disabled={isDisabled()}
        setUnit={(u: string | null) =>
          setInputs(
            produce(
              (s: any) => (s.unit = { value: u, error: false, message: '' }),
            ),
          )
        }
      />
    </Container>
  );
}
