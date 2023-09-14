import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createResource, type Component } from 'solid-js';
import { Match, Switch } from 'solid-js';
import { Routes, Route, Params, useRouteData, Navigate } from '@solidjs/router';
import { Box, CircularProgress, CssBaseline } from '@suid/material';
import { ThemeProvider } from '@suid/material/styles';

import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';

import { defaultTheme } from './theme';

const fetchUser = async () => {
  return new Promise(resolve => setTimeout(()=>resolve(false), 3000));
};

function UserData() {

  const [user] = createResource(fetchUser);
  return user;

}

const App: Component = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={Guard(Dashboard)}
          data={UserData}
        />
        <Route path="/login" component={LoginForm} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;

function Guard(child: Component) {

  const user: any = useRouteData();
  console.log(user);

  return <Switch fallback={<Progress />} >
      <Match when={user()}> 
      {child}
      </Match>
    <Match when={user() === false}>
    <Navigate href='/login' />
    </Match>
    </Switch>
}

function Progress() {
  return (
  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
    <CircularProgress />
  </Box>
  )
}
