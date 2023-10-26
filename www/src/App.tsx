import type { Component, JSX } from 'solid-js';
import { Suspense } from 'solid-js';
import { useRoutes, Router } from '@solidjs/router';
import { CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import Loading from './components/Loading';
import Progress from './components/Progress';

import { defaultTheme } from './theme';
import routes from './pages/routes';

const App: Component = (): JSX.Element => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Suspense fallback={<Progress />}>
          <Routes />
        </Suspense>
        <Toaster />
        <Loading />
      </ThemeProvider>
    </Router>
  );
};

export default App;
