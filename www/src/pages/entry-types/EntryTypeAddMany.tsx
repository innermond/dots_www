import {
  Container,
  useTheme,
  FormGroup,
  Button,
  TextField,
} from '@suid/material';
import {
  JSX,
  createEffect,
  createResource,
  createMemo,
  untrack,
  onMount,
  onCleanup,
  createSignal,
} from 'solid-js';
import type { FieldNames, Validators } from '@/lib/form';
import { required, minlen, maxlen } from '@/lib/form';
import toasting from '@/lib/toast';
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
const names = ['entry-types'];
type Names = FieldNames<typeof names>;

// set up validation
const validators: Validators<Names> = {
  'entry-types': [required()],
};

export default function EntryTypeAddMany(): JSX.Element {
  onMount(() => {
    listen('dots:cancelRequest', onStop);
  });
  onCleanup(() => {
    unlisten('dots:cancelRequest', onStop);
  });

  // TODO flawed, state.result is deeceiving
  // once we abort the request we cannot get back a result!
  const onStop = () => {};

  listen('dots:cancelRequest', onStop);

  createEffect(() => {
    dispatch('dots:fresh:EntryType', []);
  });

  return (
    <ActionForm
      title="Add many entry type"
      names={names}
      actionFn={apiEntryType.addx}
      validators={validators}
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
        <TextField
          name="entry-types"
          label="upload entry types"
          type="field"
          id="entry-types"
          sx={{ width: '10rem' }}
        >
          <Button variant="contained" component="span">
            upload
          </Button>
        </TextField>
      </Container>
    </ActionForm>
  );
}
