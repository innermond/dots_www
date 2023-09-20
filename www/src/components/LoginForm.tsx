import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, createResource, Show } from 'solid-js';
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
  CircularProgress,
  Stack,
  Alert,
} from '@suid/material';
import LockOutlinedIcon from '@suid/icons-material/LockOutlined';
//import ErrorOutlinedIcon from '@suid/icons-material/ErrorOutlined';
import { toast } from 'solid-toast';
import { login } from '../lib/api';

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
  const [startSubmit, setStartSubmit] = createSignal<Event|null>();
  const [submitForm] = createResource(startSubmit, fetchLoginData);

  let isDisabled = submitForm.loading;

  createEffect(() => {
    if (submitForm.error) {
    toast.custom(() => <Alert severity="error">This is an error alert — check it out!</Alert>, {
	duration: 6000,
	unmountDelay: 0
})
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
        <Typography component="p">
{submitForm.loading && 'loading'}
{submitForm.error && 'error'}
{submitForm.state}
        </Typography>
        <form 
          onSubmit={e => setStartSubmit(e)}
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
            disabled={isDisabled}
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
            disabled={isDisabled}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isDisabled}
          >
          <Show when={submitForm.loading} fallback={'Sign In'}>
            <Stack spacing={'1rem'} direction="row" >
              <CircularProgress sx={{color: '#fff'}} disableShrink size={'1rem'} /> <p>Sign In</p>
            </Stack>
          </Show>
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
      <Copyright ></Copyright>
    </Container>
  );
};

export default LoginForm;
