import type { Component } from 'solid-js';
import { CssBaseline } from '@suid/material';
import { createTheme, ThemeProvider } from '@suid/material/styles';

import LoginForm from './components/LoginForm';

const App: Component = () => {
//const defaultTheme = createTheme();
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
  return (
  <ThemeProvider theme={darkTheme}>
  <CssBaseline />
  <LoginForm />
  </ThemeProvider>
  );
};

export default App;
