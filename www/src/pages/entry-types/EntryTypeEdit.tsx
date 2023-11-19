import { Container, useTheme, FormGroup } from '@suid/material';
import {
  type Accessor,
  type Setter,
  type JSX,
  createEffect,
  Resource,
} from 'solid-js';
import InputOrSelect from './InputOrSelect';
import type { EntryTypeData } from '@/pages/entry-types/types';
import {
  isEntryTypeData,
  isKeyofEntryTypeData,
} from '@/pages/entry-types/types';

import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import { SetStoreFunction, Store, produce } from 'solid-js/store';
import type {
  FieldNames,
  MessagesMap,
  InnerValidation,
  Validable,
  Validators,
  Validation,
} from '@/lib/form';
import { required, minlen, maxlen, optional, int } from '@/lib/form';
import toasting from '@/lib/toast';

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

export default function EntryTypeEdit(props: {
  inputs: Store<Validable<keyof EntryTypeData>>;
  setInputs: SetStoreFunction<Validable<keyof EntryTypeData>>;
  isDisabled: Accessor<boolean>;
  setValidation: Setter<InnerValidation<string>>;
  submitForm: Resource<EntryTypeData>;
}): JSX.Element {
  props.setValidation({ validators, messages });

  const handleInput = (e: InputEvent) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    if (!name || value === undefined || isKeyofEntryTypeData(name)) {
      return;
    }

    props.setInputs(
      name as keyof EntryTypeData,
      { value, error: false, message: '' } as Validation,
    );
  };

  createEffect(() => {
    if (props.submitForm.state === 'ready') {
      const result = props.submitForm() as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been edited`);
    }
  });

  const id = props.inputs.id.value;
  const code = props.inputs.code.value;
  const description = props.inputs.description.value;

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
          InputLabelProps={{ shrink: !!props.inputs.code.value }}
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ maxWidth: '10rem' }}
          defaultValue={code}
          onInput={handleInput}
          error={props.inputs.code.error}
          helperText={props.inputs.code.message}
          disabled={props.isDisabled()}
        />
        <TextFieldEllipsis
          InputLabelProps={{ shrink: !!props.inputs.description.value }}
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
          defaultValue={description}
          onInput={handleInput}
          error={props.inputs.description.error}
          helperText={props.inputs.description.message}
          disabled={props.isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        unit={props.inputs.unit}
        setUnit={(u: string | null) =>
          props.setInputs(
            produce(
              (s: any) => (s.unit = { value: u, error: false, message: '' }),
            ),
          )
        }
        disabled={props.isDisabled()}
      />
    </Container>
  );
}
