import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, createResource } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  Typography,
  Link,
  Container,
  Box,
  Avatar,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Alert,
} from '@suid/material';
import LockOutlinedIcon from '@suid/icons-material/LockOutlined';
import { toast } from 'solid-toast';

import { login } from '@/lib/api';
import { setLoading } from '@/components/Loading';
import type { Validable, Validators, MessagesMap } from '@/lib/form';
import {
  required,
  minlen,
  maxlen,
  likeemail,
  checkpass,
  validate,
} from '@/lib/form';
import { useNavigate } from '@solidjs/router';

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

const initialValues = {
  email: {
    value: '',
    error: false,
    message: '',
  },
  password: {
    value: '',
    error: false,
    message: '',
  },
};
const defaultInputs: Validable<{ email: string; password: string }> =
  initialValues;

const validators: Validators<'email' | 'password'> = {
  email: [required(), likeemail(), minlen(7), maxlen(100)],
  //password: [required, minlen(8), maxlen(15), checkpass([""])],
  password: [checkpass('')],
};
const messages: MessagesMap<'email' | 'password'> = {
  password: [
    //(f:string) => `${f} is required`,
    //(f:string, v:string, {len}:{len:number}) => `${f} must be more than ${len} - has ${v.length}`,
    //(f:string, v:string, {len}:{len:number}) => `${f} must be less than ${len} - has ${v.length}`,
    (__: string, _: string, { tips }: { tips: string }) => tips,
  ],
};

const Copyright: Component = (): JSX.Element => {
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
  const [inputs, setInputs] = createStore(defaultInputs);

  function handleInput(e: Event) {
    e.preventDefault();
    const { name, value } = e.target as HTMLInputElement;
    if (!['email', 'password'].includes(name)) return;

    const multierrors: string = validate<'email' | 'password'>(
      name,
      value,
      validators,
      messages,
    );
    setInputs(name as 'email' | 'password', v => {
      return { ...v, error: multierrors.length > 0, message: multierrors };
    });
  }

  const [startSubmit, setStartSubmit] = createSignal<Event | null>();

  const [submitForm] = createResource(startSubmit, fetchLoginData);
  const isDisabled = () => submitForm.loading;
  const navigate = useNavigate();

  let formRef: HTMLFormElement | null = null;

  //const key = 'dots.tok';
  // TODO this is tricky
  /*if (!!sessionStorage.getItem(key)) {
    navigate('/');
  }*/

  createEffect(() => {
    if (submitForm.loading) {
      toast.dismiss();
      setLoading(true);
    }
  });

  createEffect(() => {
    if (submitForm.state === 'ready') {
      const result = submitForm() as any;
      if (!(result instanceof Error) && result.hasOwnProperty('token_access')) {
        const token_access = result.token_access;
        const key = 'dots.tok';
        sessionStorage.setItem(key, token_access);
        navigate('/');
      }

      toast.dismiss();
      setLoading(false);

      const zero = {
        value: '',
        error: false,
        message: '',
      };
      setInputs({ email: zero, password: zero });
      formRef?.reset();
    }
  });

  createEffect(() => {
    if (submitForm.error) {
      const data = submitForm.error;
      const message = data?.error ?? data?.cause?.error ?? 'An error occured';
      toast.custom(() => <Alert severity="error">{message}</Alert>, {
        duration: 6000,
        unmountDelay: 0,
      });
      setLoading(false);
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
        <form
          ref={formRef!}
          novalidate
          onInput={handleInput}
          onSubmit={setStartSubmit}
        >
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
            helperText={inputs.email.message}
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
            helperText={inputs.password.message}
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
