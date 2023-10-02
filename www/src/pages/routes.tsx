import {useRouteData, RouteDefinition, Navigate} from "@solidjs/router";
import type { Component, JSX } from 'solid-js';
import { Match, Switch, ErrorBoundary, createSignal } from 'solid-js';
import { Alert } from '@suid/material';
import Progress from '../components/Progress';
import Dashboard from './dashboard';
import LoginForm from './login';
import Assignment from './Assignment';
import HelloDashboard from './HelloDashboard';
import NotFound from './404';

function TokenData() {
  const [token, setToken] = createSignal('');
  const key = 'dots.tok';
  const tok = sessionStorage.getItem(key);
  setToken(tok ?? '');
  return token;
}

const alert = (err: Error): JSX.Element => (<Alert severity="error">{err.message}</Alert>);

const guard = (child: Component): Component => {
  return  (): JSX.Element => {
    const token: any = useRouteData();

    return (
      <ErrorBoundary fallback={alert} >
        <Switch fallback={<Progress />}>
          <Match when={!!token()}>{child}</Match>
          <Match when={token() === ''}>
            <Navigate href="/login" />
          </Match>
        </Switch>
      </ErrorBoundary>
    );
  };
};

const routes: RouteDefinition[] = [
  //{path: "/", component: guard(Dashboard), data: TokenData},
  {path: "/dashboard", component: HelloDashboard},
  {path: "/login", component: LoginForm},
  {path: "/", component: guard(Dashboard), data: TokenData, children: [{path: "/", component: HelloDashboard}, {path: "/assignment", component: Assignment}]},
  {path: "/*", component: NotFound},
];

export default routes;
