import { Container, useTheme, FormGroup } from '@suid/material';
import { JSX, createEffect } from 'solid-js';
import InputOrSelect from './InputOrSelect';
import type { EntryTypeData } from '@/pages/entry-types/types';
import {
  isEntryTypeData,
  isKeyofEntryTypeData,
} from '@/pages/entry-types/types';

import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import { produce } from 'solid-js/store';
import type {
  FieldNames,
  MessagesMap,
  Validators,
  Validation,
} from '@/lib/form';
import { required, minlen, maxlen, optional, int } from '@/lib/form';
import toasting from '@/lib/toast';
import { DialogProviderValue, useDialog } from '@/contexts/DialogContext';

const theme = useTheme();
const names = ['id', 'code', 'description', 'unit'];
type Names = FieldNames<typeof names>;

// set up validation
const validators: Validators<Names> = {
  id: [required, int],
  code: [required, minlen(7), maxlen(50)],
  description: [optional, minlen(7), maxlen(100)],
  unit: [required, minlen(3), maxlen(20)],
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
  id: [textmessages[0], (f: string) => f + ' must be number'],
  code: textmessages,
  description: [() => '', ...textmessages.slice(1)],
  unit: textmessages,
};

export default function EntryTypeEdit(): JSX.Element {
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
      { value, error: false, message: '' } as Validation,
    );
  };

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been edited`);
    }
  });

  const id = inputs.id.value;
  const code = inputs.code.value;
  const description = inputs.description.value;

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
      <TextFieldEllipsis
        name="id"
        label="Id"
        type="hidden"
        id="id"
        defaultValue={id}
        sx={{ display: 'none' }}
      />
      <FormGroup
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          columnGap: theme.spacing(1),
          rowGap: theme.spacing(2),
        }}
      >
        <TextFieldEllipsis
          InputLabelProps={{ shrink: !!inputs.code.value }}
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ maxWidth: '10rem' }}
          defaultValue={code}
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
          defaultValue={description}
          onInput={handleInput}
          error={inputs.description.error}
          helperText={inputs.description.message}
          disabled={isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        unit={inputs.unit}
        setUnit={(u: string | null) =>
          setInputs(
            produce(
              (s: any) => (s.unit = { value: u, error: false, message: '' }),
            ),
          )
        }
        disabled={isDisabled()}
      />
    </Container>
  );
}
