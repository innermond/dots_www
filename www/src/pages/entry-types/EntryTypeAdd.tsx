import { Container, useTheme, FormGroup } from '@suid/material';
import {
  JSX,
  createEffect,
  createResource,
  createMemo,
  untrack,
} from 'solid-js';
import InputOrSelect from './InputOrSelect';
import {
  isEntryTypeData,
  isDataEntryTypeUnits,
} from '@/pages/entry-types/types';
import type {
  DataEntryTypeUnits,
  EntryTypeData,
} from '@/pages/entry-types/types';

import { entryTypeZero } from '@/pages/entry-types/types';
import type { FieldNames, Validators } from '@/lib/form';
import { required, minlen, maxlen } from '@/lib/form';
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
  code: [required(), minlen(7), maxlen(50)],
  description: [required(), minlen(7), maxlen(100)],
  unit: [required(), minlen(2), maxlen(20)],
};

export default function EntryTypeAdd(): JSX.Element {
  const {
    inputs,
    setInitialInputs,
    isDisabled,
    setValidation,
    submitForm,
    validateInputUpdateStore,
    handleChange,
  } = useDialog() as DialogProviderValue<EntryTypeData>;

  // list of units
  const [unitsResource, { mutate }] = createResource(apiEntryType.units);
  const units = createMemo((): InputOrSelectOption[] => {
    if (unitsResource.state !== 'ready') {
      return [];
    }

    const info = unitsResource(); // <- this gives us string[]
    if (!isDataEntryTypeUnits(info)) {
      toasting('expected units like data from server', 'error');
      return [];
    }

    const { data, n } = info as any;
    return n ? data.map((u: string) => ({ value: u, label: u })) : [];
  });

  setValidation({ validators });

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been added`);

      untrack(() => {
        if (result.unit !== inputs.unit.value) {
          mutate((prev: DataEntryTypeUnits | Error | undefined) => {
            if (prev === undefined) {
              return prev;
            }
            if (prev instanceof Error) {
              return prev;
            }

            let { data, n } = prev;
            if (!data.includes(result.unit)) {
              data.push(result.unit);
              n++;
            }
            return { data, n };
          });
        }
      });

      setInitialInputs(entryTypeZero);
      document.dispatchEvent(
        new CustomEvent('dots:fresh:EntryType', {
          bubbles: true,
          detail: result,
        }),
      );
    }
  });

  const code = inputs.code.value;
  const description = inputs.description.value;

  const setUnit = (u: string | null) =>
    validateInputUpdateStore({ name: 'unit', value: u });

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
        setUnit={setUnit}
      />
    </Container>
  );
}
