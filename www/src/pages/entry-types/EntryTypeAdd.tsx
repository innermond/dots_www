import { Container, TextField, useTheme, FormGroup } from '@suid/material';
import type { Accessor, Setter, JSX } from 'solid-js';
import InputOrSelect from './InputOrSelect';
import type { EntryTypeData } from '@/pages/entry-types/types';
import { SetStoreFunction, Store } from 'solid-js/store';
import type {
  FieldNames,
  MessagesMap,
  InnerValidation,
  Validable,
  Validators,
} from '@/lib/form';
import { required, minlen, maxlen } from '@/lib/form';
import TextFieldEllipsis from '@/components/TextFieldEllipsis';

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

export default function EntryTypeAdd(props: {
  inputs: Store<Validable<keyof Omit<EntryTypeData, 'id'>>>;
  setInputs: SetStoreFunction<Validable<keyof EntryTypeData>>;
  isDisabled: Accessor<boolean>;
  setValidation: Setter<InnerValidation<string>>;
}): JSX.Element {
  props.setValidation({ validators, messages });

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
          InputLabelProps={{ shrink: !!props.inputs.code.value }}
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ width: '10rem' }}
          value={props?.inputs.code.value}
          error={props?.inputs.code.error}
          helperText={props?.inputs.code.message}
          disabled={props?.isDisabled()}
        />
        <TextFieldEllipsis
          InputLabelProps={{ shrink: !!props.inputs.description.value }}
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
          value={props?.inputs.description.value}
          error={props?.inputs.description.error}
          helperText={props?.inputs.description.message}
          disabled={props?.isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        unit={props?.inputs.unit}
        disabled={props?.isDisabled()}
        setUnit={(u: string | null) =>
          props.setInputs('unit', { value: u, error: false, message: '' })
        }
      />
    </Container>
  );
}
