import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, createResource, For, Show } from 'solid-js';
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

type Validable = {
  [key in 'email' | 'password']: {
    error: boolean,
    message: string[],
  }
};

type FuncWithArgs = ((...params:any) => boolean) & {args: object};

const defaultInputs: Validable = {
  email: {
    error: false,
    message: [],
  },
  password: {
    error: false,
    message: [],
  },
};

function required(v: any): boolean {
  return !!v; 
}
function likeemail(v: any): boolean {
  return v.includes('@'); 
}
function minlen(len: number): FuncWithArgs {
  const fn = (v: any) => {
    const ok = (v?.length ?? 0) >= len;
    return ok;
  }

  fn.args = {len};

  return fn;
}
function maxlen(len: number): (v:any) => boolean {
  const fn = (v: any) => {
    const ok = (v?.length ?? 0) <= len;
    return ok;
  }

  fn.args = {len};

  return fn;
}
function checkPasswordStrength(password: string): [number, string[]] {
  // Initialize variables
  let strength: number = 0;
  const tips: string[] = [];

  // Check password length
  if (password.length < 8) {
    tips.push("make the password longer.");
  } else {
    strength += 1;
  }

  // Check for mixed case
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
    strength += 1;
  } else {
    tips.push("use both lowercase and uppercase letters.");
  }

  // Check for numbers
  if (password.match(/\d/)) {
    strength += 1;
  } else {
    tips.push("include at least one number.");
  }

  // Check for special characters
  if (password.match(/[^a-zA-Z\d]/)) {
    strength += 1;
  } else {
    tips.push("include at least one special character.");
  }

  // Return results
  if (strength < 2) {
    tips.unshift("easy to guess.");
  } else if (strength === 2) {
    tips.unshift("medium difficulty.");
  } else if (strength === 3) {
    tips.unshift("difficult.");
  } else {
    tips.unshift("extremely difficult.");
  }

  return [strength, tips];
}
function checkpass(tips: string[] = ['']): (v:any) => boolean {

  const fn = (v:string) => {
    const [strength, tips] = checkPasswordStrength(v);
    fn.args = {tips};
    return (strength > 3);
  };
  fn.args = {tips};

  return fn;
}

type Validators = {
  [key in 'email' | 'password']: (FuncWithArgs | Function)[];
};
const validators: Validators = {
  email: [required, likeemail, minlen(3), maxlen(10)],
  //password: [required, minlen(8), maxlen(15), checkpass([""])],
  password: [checkpass([""])],
};
const messages = {
  email: [
    (f:string) => `${f} is required`, 
    (f:string) => `${f} expects a valid email address`, 
    (f:string, v:string, {len}:{len:number}) => `${f} must be more than ${len} - has ${v.length}`, 
    (f:string, v:string, {len}:{len:number}) => `${f} must be less than ${len} - has ${v.length}`],
  password: [
    //(f:string) => `${f} is required`,
    //(f:string, v:string, {len}:{len:number}) => `${f} must be more than ${len} - has ${v.length}`,
    //(f:string, v:string, {len}:{len:number}) => `${f} must be less than ${len} - has ${v.length}`,
    (f:string, v:string, {tips}:{tips: string[]}) => tips,
  ],
};

const [inputs, setInputs] = createStore(defaultInputs);

function handleInput(e: Event) {
  e.preventDefault();
  const {name, value} = e.target as HTMLInputElement;
  if (!['email', 'password'].includes(name)) return;

  const multierrors: string[] = [];
  (validators[name as 'email' | 'password'] as Array<Function|FuncWithArgs>).forEach((validator: Function|FuncWithArgs, inx:number) => {
      if (!validator(value)) {
        if (!(name in messages)) {
          multierrors.push(`${name} is not valid`);
          return;
        }
        const fn = (messages[name as 'email'|'password'] as Array<Function|FuncWithArgs>)[inx];
        let msg: string|string[] = '';
        let args = {};
        if ('args' in validator) {
          args = {...validator.args};
        }
        if (Object.keys(args).length === 0) { 
          msg = fn(name, value);
        } else {
          msg = fn(name, value, args);
        }
        Array.isArray(msg) ? multierrors.push(...msg) : multierrors.push(msg);
      } 
  })
  setInputs(name as 'email'|'password', v => {
    return {...v, error: multierrors.length > 0, message: multierrors};
  });
}

const HelperTextMultiline = (props: {lines: string[]}) => {
  return <Show when={!!props.lines?.length}>
    <Stack direction="column"><For each={props.lines}>{line =><Box>{line}</Box>}</For></Stack>
  </Show>
}

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
