import {
  Container,
  useTheme,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  Button,
} from '@suid/material';
import { createEffect } from 'solid-js';
import type { JSX } from 'solid-js';
import type { EntryTypeData } from '@/pages/entry-types/types';
import { isEntryTypeData } from '@/pages/entry-types/types';

import type { FieldNames, Validators } from '@/lib/form';
import { required, int } from '@/lib/form';
import toasting from '@/lib/toast';
import { DialogProviderValue, useDialog } from '@/contexts/DialogContext';
import { dispatch } from '@/lib/customevent';

const theme = useTheme();
const names = ['id', 'code', 'description', 'unit'];
type Names = FieldNames<typeof names>;

// sample custom validators
/*const  alphabetic = () => {
  const fn = (v: any) => (/^[a-z]+$/i).test(v);
  fn.tpl = 'made of letters only';
  return fn;
}*/
// dummy custom validator
const numeric = (v: any) => /^[0-9]+$/i.test(v);
//numeric.tpl = 'made of numbers only';
numeric.tpl = (f: string, v: string) => `${f}[${v}] not made of numbers only`;

// set up validation
const validators: Validators<Names> = {
  id: [required(), int],
};

export default function EntryTypeEdit(): JSX.Element {
  const { inputs, setValidation, submitForm } =
    useDialog() as DialogProviderValue<EntryTypeData>;

  setValidation({ validators });

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as EntryTypeData;
      if (!isEntryTypeData(result)) {
        throw new Error('data received is not an entry type');
      }
      const { code } = result;
      toasting(`entry type "${code}" has been deleted`);

      dispatch('dots:fresh:EntryType', result);
    }
  });

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
      <TextField
        name="id"
        label="Id"
        type="hidden"
        id="id"
        defaultValue={inputs.id}
        sx={{ display: 'none' }}
      />
      <Card sx={{ minWidth: '15rem', alignSelf: 'flex-start' }}>
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
        <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>
    </Container>
  );
}
