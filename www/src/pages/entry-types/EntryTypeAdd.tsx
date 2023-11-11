import { Container, TextField, useTheme, FormGroup } from '@suid/material';
import type { Accessor, JSX } from 'solid-js';
import HelperTextMultiline from '@/components/HelperTextMultiline';
import InputOrSelect from './InputOrSelect';
import type { EntryTypeData } from '@/pages/entry-types/types';
import { Store } from 'solid-js/store';
import { Validable } from '@/lib/form';

const theme = useTheme();

export default function EntryTypeAdd(props: {
  inputs: Store<Validable<keyof Omit<EntryTypeData, 'id'>>>;
  isDisabled: Accessor<boolean>;
}): JSX.Element {
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
        <TextField
          name="code"
          label="Code"
          type="text"
          id="code"
          autoComplete="off"
          sx={{ width: '10rem' }}
          value={props.inputs.code.value}
          error={props.inputs.code.error}
          helperText={<HelperTextMultiline lines={props.inputs.code.message} />}
          disabled={props.isDisabled()}
        />
        <TextField
          name="description"
          label="Description"
          type="text"
          id="description"
          autoComplete="off"
          sx={{ flex: 1 }}
          value={props.inputs.description.value}
          error={props.inputs.description.error}
          helperText={
            <HelperTextMultiline lines={props.inputs.description.message} />
          }
          disabled={props.isDisabled()}
        />
      </FormGroup>
      <InputOrSelect
        //notifyStore={validateInputUpdateStore}
        notifyStore={() => {}}
        unit={props.inputs.unit}
        disabled={props.isDisabled()}
      />
    </Container>
  );
}
