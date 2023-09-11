import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Component } from 'solid-js';
import { CssBaseline } from '@suid/material';
import { createTheme, ThemeProvider } from '@suid/material/styles';

import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

const App: Component = () => {
const defaultTheme = createTheme();
/*const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});*/
  return (
  <ThemeProvider theme={defaultTheme}>
  <CssBaseline />
  <Dashboard />
  </ThemeProvider>
  );
};

export default App;
