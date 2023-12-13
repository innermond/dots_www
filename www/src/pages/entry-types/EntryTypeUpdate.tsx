import { Container, useTheme, FormGroup } from '@suid/material';
import {
  createEffect,
  createResource,
  untrack,
  createMemo,
  onMount,
  onCleanup,
  createSignal,
  createComputed,
} from 'solid-js';
import type { JSX } from 'solid-js';
import InputOrSelect from './InputOrSelect';
import type {
  DataEntryTypeUnits,
  EntryTypeData,
} from '@/pages/entry-types/types';
import { asEntryTypeData, isEntryTypeData } from '@/pages/entry-types/types';

import TextFieldEllipsis from '@/components/TextFieldEllipsis';
import type { MessagesMap, Validators } from '@/lib/form';
import { required, minlen, maxlen, optional, int, isSimilar } from '@/lib/form';
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
const names = ['id', 'code', 'description', 'unit'];

type Names = (typeof names)[number];

// sample custom validators
/*const  alphabetic = () => {
  const fn = (v: any) => (/^[a-z]+$/i).test(v);
  fn.tpl = 'made of letters only';
  return fn;
}*/
// dummy custom validator
//const numeric = (v: any) => /^[0-9]+$/i.test(v);
//numeric.tpl = 'made of numbers only';
//numeric.tpl = (f: string, v: string) => `${f}[${v}] not made of numbers only`;

// set up validation
const validators: Validators<Names> = {
  id: [required(), int],
  code: [required(), minlen(3), maxlen(50)],
  description: [optional, minlen(7), maxlen(100)],
  unit: [required(), minlen(3), maxlen(20)],
};

// functions that prepare error messages
const textmessages = [
  (f: string) => `${f} is compulsory`,
  //(f: string, v: string, { len }: { len: number }) => `${f} must be more than ${len} - has ${v.length}`,
];

// map error messages with field names
const messages: MessagesMap<Names> = {
  unit: textmessages,
};

export default function EntryTypeUpdate(props: any): JSX.Element {
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
    const info = unitsResource(); // <- this gives us string[]
    if (!info) {
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
        s.show.stop = true;
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

  const [editedStop, setEditedStop] = createSignal<EntryTypeData>();
  const [edited] = createResource(editedStop, apiEntryType.edit);

  const waiting = createMemo(
    () => !state.ready || ['pending', 'refreshing'].includes(edited.state),
  );

  createComputed(() => {
    if (edited.state === 'pending') {
      // post pone execution as in actionform component are other setState calls regarding "ready"
      // and they ar eexecuted AFTER a regular setState issued from here
      // TODO: create meta data like !important in CSS
      //setTimeout(() => setState('ready', false), 0);
      setState('ready', false);
    } else if (edited.state === 'ready') {
      setState('ready', true);
    } else if (edited.error) {
      setState('ready', true);
    }
    console.log('etu', state.ready);
  });

  createEffect(() => {
    if (edited.state === 'pending') {
      toasting('trying to stop changes...', 'warning');
    } else if (edited.state === 'ready') {
      toasting('stopping changes was done', 'success');
    } else if (edited.error) {
      toasting('we cannot guarantee that changes has been stopped', 'error');
    }
  });

  const onStop = (evt: Event) => {
    const [reverted, current] = (evt as CustomEvent).detail;
    if (!isEntryTypeData(reverted)) {
      toasting('we cannot guarantee that changes has been stopped');
      return;
    }
    let tobeSaved = current;
    try {
      tobeSaved = asEntryTypeData(current);
    } catch (e) {
      console.log('not an entry type', tobeSaved);
    }
    // use whatever tobeSaved may be
    // TODO this check may be miss as well (it seems to never be true)
    if (isSimilar(reverted, tobeSaved)) {
      toasting('latest data is the same - nothing need to be stopped');
      return;
    }
    setEditedStop(reverted);
  };

  // after submiting and receiving a response
  createEffect(() => {
    if (state.ready && !!state.result) {
      const result = state.result as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been edited`);

      untrack(() => {
        if (result.unit !== state.inputs.unit.value) {
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

        if (!(result instanceof Error)) {
          setState('initials', result);
        }
      });
      dispatch('dots:fresh:EntryType', result);
    }
  });

  const id = state.inputs.id.value;
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
      title="Edit entry type"
      textSave="Edit"
      names={names}
      initialInputs={state.initials}
      actionFn={apiEntryType.editx}
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
        <TextFieldEllipsis
          name="id"
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
            InputLabelProps={{ shrink: !!state.inputs.code.value }}
            name="code"
            label="Code"
            type="text"
            id="code"
            autoComplete="off"
            sx={{ maxWidth: '10rem' }}
            onChange={handleChange}
            defaultValue={code}
            value={state.inputs.code.value}
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
