import { Container, useTheme, FormGroup } from '@suid/material';
import {
  JSX,
  createEffect,
  createResource,
  createMemo,
  untrack,
  onMount,
  onCleanup,
  batch,
  createSignal,
} from 'solid-js';
import InputOrSelect from './InputOrSelect';
import {
  isEntryTypeData,
  isDataEntryTypeUnits,
  asEntryTypeData,
} from '@/pages/entry-types/types';
import type {
  DataEntryTypeUnits,
  EntryTypeData,
} from '@/pages/entry-types/types';

import { entryTypeZero } from '@/pages/entry-types/types';
import type { FieldNames, Validators } from '@/lib/form';
import { required, minlen, maxlen, isSimilar } from '@/lib/form';
import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import toasting from '@/lib/toast';
import { DialogProviderValue, useDialog } from '@/contexts/DialogContext';
import { InputOrSelectOption } from './InputOrSelect';
import { apiEntryType } from '@/api';
import { dispatch, listen, unlisten } from '@/lib/customevent';

const theme = useTheme();
const names = ['code', 'description', 'unit'];
type Names = FieldNames<typeof names>;

// sample custom validators
const alphaPosibleUppercase = (uppercase?: boolean) => {
  let rx = /^[a-z]+$/i;
  if (uppercase) {
    rx = /^[A-Z]+$/;
  }
  const fn = (v: any) => rx.test(v);
  fn.tpl = uppercase ? 'made of upcased letters only' : 'made of letters only';
  fn.args = {
    *[Symbol.iterator]() {
      yield uppercase;
      yield new Date();
    },
  };
  return fn;
};

// set up validation
const validators: Validators<Names> = {
  code: [required(), minlen(7), maxlen(50)],
  description: [required(), minlen(7), maxlen(100)],
  unit: [required(), minlen(2), maxlen(9), alphaPosibleUppercase()],
};

// messages if they are sparse, must be in sync with validators
const messages = {
  unit: [
    'put something in it',
    null,
    //(f: string, v: string, { len }: { len: number }) => `${f} must be less than ${len} - has ${v.length}`,
    null,
    (f: string, v: string, [up, date]: [boolean, Date]) =>
      `${f} expects only letters,${
        up ? ' upcased' : ''
      } has ${v} today ${date}`,
  ],
};

export default function EntryTypeAdd(): JSX.Element {
  const {
    setUI,
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

  setValidation({ validators, messages });

  onMount(() =>
    batch(() => {
      setUI('ready', true);
      setUI('show', 'stop', true);
    }),
  );
  onCleanup(() => {
    setUI('ready', false);
    unlisten('dots:cancelRequest', onStop);
  });

  const [addedStop, setAddedStop] = createSignal<EntryTypeData>();
  const [added] = createResource(addedStop, apiEntryType.add);

  const waiting = createMemo(
    () => isDisabled() || ['pending', 'refreshing'].includes(added.state),
  );

  createEffect(() => {
    if (added.loading) {
      toasting('trying to stop changes...', 'warning');
    } else if (added.state === 'ready') {
      toasting('stopping changes was done', 'success');
    } else if (added.error) {
      toasting('we cannot guarantee that changes has been stopped', 'error');
    }
  });

  const onStop = (evt: Event) => {
    const [, current] = (evt as CustomEvent).detail;
    console.log(current);
    return;
    if (!isEntryTypeData(reverted)) {
      toasting('we cannot guarantee that changes has been stopped');
      return;
    }
    let tobeSaved = {} as any;
    for (const k of Object.keys(inputs)) {
      tobeSaved[k] = inputs[k as keyof typeof inputs].value;
    }
    try {
      tobeSaved = asEntryTypeData(tobeSaved);
    } catch (e) {
      console.log('not an entry type', tobeSaved);
    }
    // use whatever tobeSaved may be
    // TODO this check may be miss as well (it seems to never be true)
    if (isSimilar(reverted, tobeSaved)) {
      toasting('latest data is the same - nothing need to be stopped');
      return;
    }
    setAddedStop(reverted);
  };

  listen('dots:cancelRequest', onStop);

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
      dispatch('dots:fresh:EntryType', result);
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
