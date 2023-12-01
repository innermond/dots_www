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
  createResource,
  createMemo,
  For,
  onMount,
  onCleanup,
  Show,
} from 'solid-js';
import type { JSX } from 'solid-js';
import type { EntryTypeData } from '@/pages/entry-types/types';

import type { FieldNames, Validators } from '@/lib/form';
import { required, int, isEmptyObject } from '@/lib/form';
import toasting from '@/lib/toast';
import { DialogProviderValue, useDialog } from '@/contexts/DialogContext';
import { dispatch } from '@/lib/customevent';
import { apiEntryType } from '@/api';

const theme = useTheme();
const names = ['id', 'dontCheckChanged'];
type Names = FieldNames<typeof names>;

// set up validation
const validators: Validators<Names> = {
  id: [required(), int],
  dontCheckChanged: [() => true],
};

export default function EntryTypeDetail(): JSX.Element {
  const { setChildrenLoaded, inputs, setValidation, submitForm } =
    useDialog() as DialogProviderValue<EntryTypeData>;

  // get stats
  const apicall = () => apiEntryType.stats(inputs.id.value);
  const [statsResource] = createResource(apicall);
  const stats = createMemo((): Record<string, string> | undefined => {
    if (statsResource.state !== 'ready') {
      return undefined;
    }

    const info = statsResource();
    setChildrenLoaded(true);

    const { data, n } = info as any;
    return n ? data : {};
  });

  setValidation({ validators });

  onCleanup(() => setChildrenLoaded(true));

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as EntryTypeData;
      if (!('n' in result && false === isNaN(parseInt(result.n as any)))) {
        throw new Error('data received is not for an entry type deletion');
      }
      toasting(`entry type "${inputs.code.value}" has been deleted`);

      const deleted: EntryTypeData = {
        id: inputs.id.value,
        code: inputs.code.value,
        description: inputs.description.value,
        unit: inputs.unit.value,
      };
      dispatch('dots:killone:EntryType', deleted);
    }
  });

  const id = inputs.id.value;

  return (
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
            {inputs.code.value}
          </Typography>
          <Typography>Description</Typography>
          <Typography sx={{ mb: 1 }} color="text.secondary">
            {inputs.description.value}
          </Typography>
          <Typography>unit</Typography>
          <Typography variant="body2">{inputs.unit.value}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ minWidth: '100%' }}>
        <CardContent style={{}}>
          <Typography>Status</Typography>
          <Typography sx={{ mb: 1 }} variant="h4">
            {stats() === undefined
              ? 'checking....'
              : isEmptyObject(stats())
              ? 'deletable'
              : 'not deletable'}
          </Typography>
          <Show when={!!stats() && !isEmptyObject(stats())}>
            <For each={Object.keys(stats() as Record<string, string>)}>
              {(k: string) => {
                return (
                  <>
                    <Typography component={'h5'}>{k}</Typography>
                    <Typography sx={{ mb: 1 }} color="text.secondary">
                      {`there are ${stats()![k]} entries that depend on ${
                        inputs.code.value
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
  );
}
