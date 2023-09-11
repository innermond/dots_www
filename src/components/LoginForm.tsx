import type { Component } from 'solid-js';
import {} from 'solid-js';
import { Typography, Link, Container, Box, Avatar, TextField, FormControlLabel, Checkbox, Button, Grid } from '@suid/material';
import LockOutlinedIcon from '@suid/icons-material/LockOutlined';
//import ErrorOutlinedIcon from '@suid/icons-material/ErrorOutlined';

const Copyright: Component = (props: any) => {
  return (
    <Typography variant="body2" color="text.secundary" align="center" {...props}>
      {'Copyright © '}
      <Link href="https://volt-media.ro">volt-media.ro</Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

const LoginForm: Component = () => {
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
      <Typography component="h1" variant="h5">Log In</Typography>
      <Box component="form" sx={{ mt: 1 }} >
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>Sign In</Button>
        <Grid container>
          <Grid item xs><Link variant="body2" href="#">Forgot password?</Link></Grid>
          <Grid item xs><Link variant="body2" href="#">Don't have an account? Sign up</Link></Grid>
        </Grid>
      </Box>
    </Box>
    <Copyright sx={{mt: 8, mb:4}}></Copyright>
  </Container>
  );
};

export default LoginForm;
