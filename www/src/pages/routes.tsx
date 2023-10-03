import {useRouteData, RouteDefinition, Navigate} from "@solidjs/router";
import type { Component, JSX } from 'solid-js';
import { Show, Suspense, Match, Switch, ErrorBoundary, createSignal, lazy, createEffect } from 'solid-js';
import { Alert } from '@suid/material';
import Progress, {isRunning} from '../components/Progress';
import {setLoading} from '../components/Loading';

const LoginForm = lazy(() => import('./login'));
const Dashboard = lazy(() => import('./dashboard'));
const HelloDashboard = lazy(() => import('./HelloDashboard'));
const Assignment = lazy(() => import('./Assignment'));
const NotFound = lazy(() => import('./404'));

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

const progress = (child: Component): Component => {
  return (): JSX.Element => {
    createEffect(() => {
      if (isRunning()) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    });

    return (
      <Suspense fallback={<Progress notifyIsRunning />}>
        <Show when={true}>{child}</Show>
      </Suspense>
    );
  };
};

const routes: RouteDefinition[] = [
  {path: "/login", component: LoginForm},
  {path: "/", component: guard(Dashboard), data: TokenData, children: [{path: "/", component: HelloDashboard}, {path: "/assignment", component: Assignment}]},
  {path: "/*", component: NotFound},
];

export default routes;
