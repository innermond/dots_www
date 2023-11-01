import type { Component, JSX } from 'solid-js';
import { useRoutes, Router } from '@solidjs/router';
import { CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import theme from './theme';
import routes from '@/pages/routes';

const App: Component = (): JSX.Element => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
};

export default App;
