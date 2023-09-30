import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Component, JSX } from 'solid-js';
import { useRoutes, Router } from '@solidjs/router';
import { CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';
import { Toaster } from 'solid-toast';

import Loading from './components/Loading';

import { defaultTheme } from './theme';
import routes from './pages/routes';

const App: Component = (): JSX.Element => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Routes />
        <Toaster />
        <Loading />
      </ThemeProvider>
    </Router>
  );
};

export default App;
