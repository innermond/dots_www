import { Container, useTheme, FormGroup } from '@suid/material';
import { JSX, createEffect, createResource } from 'solid-js';
import InputOrSelect from './InputOrSelect';
import { isEntryTypeData } from '@/pages/entry-types/types';
import type { EntryTypeData } from '@/pages/entry-types/types';

import { entryTypeZero } from '@/pages/entry-types/types';
import { produce } from 'solid-js/store';
import type { FieldNames, MessagesMap, Validators } from '@/lib/form';
import { required, minlen, maxlen, makeValidable } from '@/lib/form';
import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import toasting from '@/lib/toast';
import { DialogProviderValue, useDialog } from '@/contexts/DialogContext';
import { InputOrSelectOption } from './InputOrSelect';
import { apiEntryType } from '@/api';

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

// list of units
const [unitsResource] = createResource(apiEntryType.units);
const units = (): InputOrSelectOption[] => {
  const info = unitsResource(); // <- this gives us string[]
  if (!info) {
    return [];
  }

  const { data, n } = info as any;
  return n ? data.map((u: string) => ({ value: u, label: u })) : [];
};

export default function EntryTypeAdd(): JSX.Element {
  const {
    inputs,
    setInputs,
    isDisabled,
    setValidation,
    submitForm,
    handleChange,
  } = useDialog() as DialogProviderValue<EntryTypeData>;

  setValidation({ validators, messages });

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been added`);

      setInputs(makeValidable(entryTypeZero));
    }
  });

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
          onChange={handleChange}
          value={inputs.code.value}
          defaultValue={code}
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
          onChange={handleChange}
          defaultValue={description}
          value={inputs.description.value}
          error={inputs.description.error}
          helperText={inputs.description.message}
          disabled={isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        unit={inputs.unit}
        units={units()}
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
