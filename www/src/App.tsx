import type { Component, JSX } from 'solid-js';
import { useRoutes, Router } from '@solidjs/router';
import { CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import theme from './theme';
import routes from '@/pages/routes';
import Loading, { loading } from './components/Loading';

const App: Component = (): JSX.Element => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes />
        <Toaster />
        <Loading open={loading()} />
      </ThemeProvider>
    </Router>
  );
};

export default App;
