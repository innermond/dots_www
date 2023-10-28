import { useRouteData, RouteDefinition, Navigate } from '@solidjs/router';
import type { Component, JSX } from 'solid-js';
import {
  Suspense,
  Match,
  Switch,
  ErrorBoundary,
  createSignal,
  lazy,
  createEffect,
} from 'solid-js';
import { Alert } from '@suid/material';
import Progress, { isRunning } from '../components/Progress';
import { setLoading } from '../components/Loading';
import { Dynamic } from 'solid-js/web';
import { ApiError } from '../lib/api';

const LoginForm = lazy(() => import('./login'));
const Dashboard = lazy(() => import('./dashboard'));
const HelloDashboard = lazy(() => import('./HelloDashboard'));
const Company = lazy(() => import('./company/Company'));
const CompanyDetails = lazy(() => import('./company/CompanyDetails'));
const DeedNew = lazy(() => import('./deed/DeedNew'));
const NotFound = lazy(() => import('./404'));

function TokenData() {
  const [token, setToken] = createSignal('');
  const key = 'dots.tok';
  const tok = sessionStorage.getItem(key);
  setToken(tok ?? '');
  return token;
}

const AlertOrLogin = (err: Error | ApiError): JSX.Element => {
  console.log('route', err);
  if (err instanceof ApiError) {
    if (err.response.status === 401) {
      return <Navigate href="/login" />;
    }
  }
  return <Alert severity="error">{err.message}</Alert>;
};

const guard = (child: Component): Component => {
  return (): JSX.Element => {
    const token: any = useRouteData();

    return (
      <ErrorBoundary fallback={AlertOrLogin}>
        <Switch>
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
        <Dynamic component={child} />
      </Suspense>
    );
  };
};

const routes: RouteDefinition[] = [
  { path: '/login', component: LoginForm },
  {
    path: '/',
    component: guard(Dashboard),
    data: TokenData,
    children: [
      { path: '/', component: HelloDashboard },
      { path: '/company/:id', component: CompanyDetails },
      { path: '/companies', component: Company },
      { path: '/deed', component: DeedNew },
    ],
  },
  { path: '/*', component: NotFound },
];

export default routes;
