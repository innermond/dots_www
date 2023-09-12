import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Component } from 'solid-js';
import { CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';

import Dashboard from './components/Dashboard';

import { defaultTheme } from './theme';

const App: Component = () => {
  return (
  <ThemeProvider theme={defaultTheme}>
  <CssBaseline />
  <Dashboard />
  </ThemeProvider>
  );
};

export default App;
