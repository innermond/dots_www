import type { Component, JSX } from 'solid-js';
import {
  createSignal,
  createEffect,
  createResource,
  For,
  Show,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  Typography,
  Link,
  Container,
  Box,
  Stack,
  Avatar,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Alert,
} from '@suid/material';
import LockOutlinedIcon from '@suid/icons-material/LockOutlined';
//import ErrorOutlinedIcon from '@suid/icons-material/ErrorOutlined';
import { toast } from 'solid-toast';
import { login } from '../lib/api';
import { setLoading } from './Loading';
import type { Validable, Validator, Validators, MessagesMap, Messages } from '../lib/form';
import {required, minlen, maxlen, likeemail, checkpass, validate} from '../lib/form';

async function fetchLoginData(e: Event) {
  e.preventDefault();
  const data = new FormData(e.target as HTMLFormElement).entries();
  const result: Record<string, string> = {};
  for (const [k, v] of data) {
    result[k] = v as string;
  }
  const { email, password } = result;
  const requestData = { usr: email, pwd: password };
  return login(requestData);
}

const defaultInputs: Validable<'email'|'password'> = {
  email: {
    error: false,
    message: [],
  },
  password: {
    error: false,
    message: [],
  },
};

const validators: Validators<'email'|'password'> = {
  email: [required, likeemail, minlen(3), maxlen(10)],
  //password: [required, minlen(8), maxlen(15), checkpass([""])],
  password: [checkpass([''])],
};
const messages: MessagesMap<'email'|'password'> = {
  email: [
    (f: string) => `${f} is required`,
    (f: string) => `${f} expects a valid email address`,
    (f: string, v: string, { len }: { len: number }) =>
      `${f} must be more than ${len} - has ${v.length}`,
    (f: string, v: string, { len }: { len: number }) =>
      `${f} must be less than ${len} - has ${v.length}`,
  ],
  password: [
    //(f:string) => `${f} is required`,
    //(f:string, v:string, {len}:{len:number}) => `${f} must be more than ${len} - has ${v.length}`,
    //(f:string, v:string, {len}:{len:number}) => `${f} must be less than ${len} - has ${v.length}`,
    (f: string, v: string, { tips }: { tips: string[] }) => tips,
  ],
};

const [inputs, setInputs] = createStore(defaultInputs);

function handleInput(e: Event) {
  e.preventDefault();
  const { name, value } = e.target as HTMLInputElement
  if (!['email', 'password'].includes(name)) return;

  const multierrors: string[] = validate< 'email' | 'password'>(name, value, validators, messages);
  setInputs(name as 'email' | 'password', v => {
    return { ...v, error: multierrors.length > 0, message: multierrors };
  });
}

const HelperTextMultiline = (props: { lines: string[] }) => {
  return (
    <Show when={!!props.lines?.length}>
      <Stack direction="column">
        <For each={props.lines}>{line => <Box>{line}</Box>}</For>
      </Stack>
    </Show>
  );
};

const Copyright: Component = () => {
  return (
    <Typography
      sx={{ mt: 8, mb: 4 }}
      variant="body2"
      color="text.secundary"
      align="center"
    >
      {'Copyright © '}
      <Link href="https://volt-media.ro">volt-media.ro</Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

const LoginForm: Component = (): JSX.Element => {
  const [startSubmit, setStartSubmit] = createSignal<Event | null>();

  const [submitForm] = createResource(startSubmit, fetchLoginData);
  const isDisabled = () => submitForm.loading;

  createEffect(() =>
    isDisabled() ? setLoading(true) && toast.dismiss() : setLoading(false),
  );

  createEffect(() => {
    if (submitForm.error) {
      toast.custom(
        () => (
          <Alert severity="error">This is an error alert — check it out!</Alert>
        ),
        {
          duration: 6000,
          unmountDelay: 0,
        },
      );
    }
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Log In
        </Typography>
        <form novalidate onInput={handleInput} onSubmit={setStartSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="off"
            autoFocus
            disabled={isDisabled()}
            error={inputs.email.error}
            helperText={<HelperTextMultiline lines={inputs.email.message} />}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="off"
            disabled={isDisabled()}
            error={inputs.password.error}
            helperText={<HelperTextMultiline lines={inputs.password.message} />}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                disabled={isDisabled()}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isDisabled()}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link variant="body2" href="#">
                Forgot password?
              </Link>
            </Grid>
            <Grid item xs>
              <Link variant="body2" href="#">
                Don't have an account? Sign up
              </Link>
            </Grid>
          </Grid>
        </form>
      </Box>
      <Copyright></Copyright>
    </Container>
  );
};

export default LoginForm;
