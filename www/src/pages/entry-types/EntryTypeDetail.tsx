import {
  Container,
  useTheme,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@suid/material';
import {
  createEffect,
  createSignal,
  createComputed,
  createResource,
  createMemo,
  For,
  onCleanup,
  Show,
  onMount,
} from 'solid-js';
import type { JSX } from 'solid-js';
import { setActionAlert } from '@/components/AlertDialog';
import type { EntryTypeData } from '@/pages/entry-types/types';
import { isEntryTypeData } from '@/pages/entry-types/types';
import ActionForm from '@/components/ActionForm';
import {
  ActionFormContextState,
  ActionFormContextValue,
  useActionForm,
} from '@/contexts/ActionFormContext';

import type { FieldNames, MessagesMap, Validators } from '@/lib/form';
import { required, int, isEmptyObject } from '@/lib/form';
import toasting from '@/lib/toast';
import { dispatch, listen, unlisten } from '@/lib/customevent';
import { apiEntryType } from '@/api';
import { produce } from 'solid-js/store';
import { AlertDialogState } from '@/components/AlertDialog';

const theme = useTheme();
const names = ['id', 'dontCheckChanged'];
type Names = FieldNames<typeof names>;

// set up validation
const validators: Validators<Names> = {
  id: [required(), int],
  dontCheckChanged: [() => true],
};

const messages: MessagesMap<Names> = {
  id: [null, null],
  dontCheckChanged: [null],
};

export default function EntryTypeDetail(): JSX.Element {
  const { actionFormState: state, setActionFormContextState: setState } =
    useActionForm() as ActionFormContextValue<EntryTypeData>;

  // get stats
  const apicall = () => apiEntryType.stats(state.inputs.id.value);
  const [statsResource] = createResource(apicall);
  const stats = createMemo((): Record<string, string> | undefined => {
    if (statsResource.state !== 'ready') {
      return undefined;
    }

    const info = statsResource();

    setState('ready', true);

    const { data, n } = info as any;
    return n ? data : {};
  });

  onMount(() => {
    setState(
      produce((s: ActionFormContextState<EntryTypeData>) => {
        s.askMeBeforeAction = true;
        s.ready = true;
        s.open = true;
        s.show.reset = false;
        s.show.stop = true;
      }),
    );
    setActionAlert(
      produce((s: AlertDialogState) => {
        s.title = `You are about to delete the entry type "${state.inputs.code.value}"`;
        s.text =
          'This entry type is in such state that it can be deleted. Also, it may be restored in the future if you will choose this';
      }),
    );

    listen('dots:killone:EntryType', handleKillOneEntryType as EventListener);
    listen('dots:cancelRequest', onStop);
  });
  onCleanup(() => {
    setState(
      produce((s: ActionFormContextState<EntryTypeData>) => {
        s.ready = true;
        s.result = undefined;
      }),
    );
    unlisten('dots:killone:EntryType', handleKillOneEntryType as EventListener);
    unlisten('dots:cancelRequest', onStop);
  });

  const onStop = (evt: Event) => {
    evt.stopPropagation();
    evt.preventDefault();
    console.log(evt);
    /* const [reverted, current] = (evt as CustomEvent).detail;
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
    setEditedStop(reverted);*/
  };

  type Status = 'checking' | 'deletable' | 'not deletable' | 'deleted';
  const [status, setStatus] = createSignal<Status>();
  createComputed(() => {
    if (stats() === undefined) {
      setStatus('checking');
    } else if (isEmptyObject(stats())) {
      setStatus('deletable');
    } else {
      setStatus('not deletable');
    }
  });

  const handleKillOneEntryType = (evt: CustomEvent) => {
    if (!isEntryTypeData(evt.detail)) {
      return;
    }
    setStatus('deleted');
    setState('ready', true);
  };

  createEffect(() => {
    if (state.ready && !!state.result) {
      const result = state.result;
      if (result instanceof Error) {
        return;
      }
      if (!('n' in result && false === isNaN(parseInt(result.n as any)))) {
        throw new Error('data received is not for an entry type deletion');
      }
      toasting(`entry type "${state.inputs.code.value}" has been deleted`);

      const deleted: EntryTypeData = {
        id: state.inputs.id.value,
        code: state.inputs.code.value,
        description: state.inputs.description.value,
        unit: state.inputs.unit.value,
      };
      dispatch('dots:killone:EntryType', deleted);
    }
  });

  const id = state.inputs.id.value;

  return (
    <ActionForm
      title="Detail entry type"
      textSave="Deactivate"
      names={names}
      initialInputs={state.initials}
      actionFn={apiEntryType.del}
      validators={validators}
      messages={messages}
    >
      <Container
        sx={{
          padding: theme.spacing(3),
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: theme.spacing(2),
          columnGap: theme.spacing(2),
        }}
      >
        <TextField
          name="id"
          type="hidden"
          id="id"
          defaultValue={id}
          sx={{ display: 'none' }}
        />
        <TextField
          name="dontCheckChanged"
          type="hidden"
          id="dontCheckChanged"
          defaultValue={true}
          sx={{ display: 'none' }}
        />
        <Card sx={{ minWidth: '100%' }}>
          <CardContent style={{}}>
            <Typography>Code</Typography>
            <Typography sx={{ mb: 1 }} variant="h5">
              {state.inputs.code.value}
            </Typography>
            <Typography>Description</Typography>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              {state.inputs.description.value}
            </Typography>
            <Typography>unit</Typography>
            <Typography variant="body2">{state.inputs.unit.value}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: '100%' }}>
          <CardContent style={{}}>
            <Typography>Status</Typography>
            <Typography sx={{ mb: 1 }} variant="h4">
              {status()}
            </Typography>
            <Show when={!!stats() && !isEmptyObject(stats())}>
              <For each={Object.keys(stats() as Record<string, string>)}>
                {(k: string) => {
                  return (
                    <>
                      <Typography component={'h5'}>{k}</Typography>
                      <Typography sx={{ mb: 1 }} color="text.secondary">
                        {`there are ${stats()![k]} entries that depend on ${
                          state.inputs.code.value
                        }`}
                      </Typography>
                    </>
                  );
                }}
              </For>
            </Show>
          </CardContent>
        </Card>
      </Container>
    </ActionForm>
  );
}
