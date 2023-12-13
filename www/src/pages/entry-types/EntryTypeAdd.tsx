import { Container, useTheme, FormGroup } from '@suid/material';
import {
  JSX,
  createEffect,
  createResource,
  createMemo,
  untrack,
  onMount,
  onCleanup,
  createSignal,
  createComputed,
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
import { required, minlen, maxlen } from '@/lib/form';
import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import toasting from '@/lib/toast';
import { InputOrSelectOption } from './InputOrSelect';
import { apiEntryType } from '@/api';
import { dispatch, listen, unlisten } from '@/lib/customevent';
import ActionForm from '@/components/ActionForm';
import {
  ActionFormContextState,
  ActionFormContextValue,
  useActionForm,
} from '@/contexts/ActionFormContext';
import { produce } from 'solid-js/store';

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
    actionFormState: state,
    setActionFormContextState: setState,
    validateInputUpdateStore,
    makeHandleChange,
  } = useActionForm() as ActionFormContextValue<EntryTypeData>;

  const handleChange = makeHandleChange(validators, messages);

  // list of units
  const [unitsResource, { mutate }] = createResource(apiEntryType.units);
  const units = createMemo((): InputOrSelectOption[] => {
    console.log('units');
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

  onMount(() => {
    setState(
      produce((s: ActionFormContextState<EntryTypeData>) => {
        s.ready = true;
        s.open = true;
        s.show.stop = false;
      }),
    );
    listen('dots:cancelRequest', onStop);
  });
  onCleanup(() => {
    setState(
      produce((s: ActionFormContextState<EntryTypeData>) => {
        s.ready = false;
        s.open = false;
        s.result = undefined;
      }),
    );
    unlisten('dots:cancelRequest', onStop);
  });

  const [delStop, setDelStop] = createSignal<EntryTypeData>();
  const [del] = createResource(delStop, apiEntryType.del);

  const waiting = createMemo(
    () => !state.ready || ['pending', 'refreshing'].includes(del.state),
  );
  /*
  createComputed(() => {
    if (del.state === 'pending') {
      // post pone execution as in actionform component are other setState calls regarding "ready"
      // and they ar eexecuted AFTER a regular setState issued from here
      setTimeout(() => setState('ready', false), 0);
      //setState('ready', false);
    } else if (del.state === 'ready') {
      setState('ready', true);
    } else if (del.error) {
      setState('ready', true);
    }
  });

  createEffect(() => {
    if (del.state === 'pending') {
      toasting('trying to stop changes...', 'warning');
    } else if (del.state === 'ready') {
      toasting('stopping changes was done', 'success');
    } else if (del.error) {
      toasting('we cannot guarantee that changes has been stopped', 'error');
    }
  });
*/
  // TODO flawed, state.result is deeceiving
  // once we abort the request we cannot get back a result!
  const onStop = () => {
    if (!isEntryTypeData(state.result)) {
      toasting('We cannot undo it just now. Try again!');
      return;
    }
    let tobeSaved = {} as any;
    try {
      tobeSaved = asEntryTypeData(state.result);
    } catch (e) {
      console.log('not an entry type', tobeSaved);
    }

    setDelStop(state.result);
    setState('ready', false);
  };

  listen('dots:cancelRequest', onStop);

  createEffect(() => {
    if (state.ready && !!state.result) {
      const result = state.result as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been added`);

      untrack(() => {
        if (
          result.unit !== undefined &&
          result.unit !== state.inputs.unit.value
        ) {
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

      setState('initials', entryTypeZero);
      dispatch('dots:fresh:EntryType', result);
    }
  });

  const code = state.inputs.code.value;
  const description = state.inputs.description.value;

  const setUnit = (u: string | null) =>
    validateInputUpdateStore(
      { name: 'unit', value: u },
      false,
      validators,
      messages,
      ['unit'],
    );

  return (
    <ActionForm
      title="Add entry type"
      textSave="Add"
      names={names}
      initialInputs={state.initials}
      actionFn={apiEntryType.addx}
      validators={validators}
      messages={messages}
    >
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
            InputLabelProps={{ shrink: !!state.inputs.code.value }}
            name="code"
            label="Code"
            type="text"
            id="code"
            autoComplete="off"
            sx={{ width: '10rem' }}
            onChange={handleChange}
            value={state.inputs.code.value}
            defaultValue={code}
            error={state.inputs.code.error}
            helperText={state.inputs.code.message}
            disabled={waiting()}
          />
          <TextFieldEllipsis
            InputLabelProps={{ shrink: !!state.inputs.description.value }}
            name="description"
            label="Description"
            type="text"
            id="description"
            autoComplete="off"
            sx={{ flex: 1 }}
            onChange={handleChange}
            defaultValue={description}
            value={state.inputs.description.value}
            error={state.inputs.description.error}
            helperText={state.inputs.description.message}
            disabled={waiting()}
          />
        </FormGroup>
        <InputOrSelect
          unit={state.inputs.unit}
          units={units()}
          setUnit={setUnit}
          disabled={waiting()}
        />
      </Container>
    </ActionForm>
  );
}
