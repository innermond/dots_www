import type { Component } from 'solid-js';
import { CssBaseline } from '@suid/material';

import LoginForm from './components/LoginForm';

const App: Component = () => {
  return (
  <>
  <CssBaseline />
  <LoginForm />
  </>);
};

export default App;
