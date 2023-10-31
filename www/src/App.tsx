import type { Component, JSX } from 'solid-js';
import { useRoutes, Router } from '@solidjs/router';
import { CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import { defaultTheme } from './theme';
import routes from '@/pages/routes';

const App: Component = (): JSX.Element => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Routes />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
};

export default App;
