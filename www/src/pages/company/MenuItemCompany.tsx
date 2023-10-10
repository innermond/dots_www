import {
  JSX,
  Component,
  Show,
  createSignal,
  For,
  Switch,
  Resource,
  Match,
  createEffect,
  createMemo,
} from 'solid-js';
import AssignmentIcon from '@suid/icons-material/Assignment';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';
import ErrorIcon from '@suid/icons-material/Error';
import {
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Alert,
} from '@suid/material';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

import { CompanyData } from './types';
import Progress from '../../components/Progress';
import { HttpError } from '../../lib/api';

type DataMenuItemCompany = Resource<Error | JSON>;

type PropsMenuItemCompany = {
  data: DataMenuItemCompany;
};

type DataCompanies = { data: CompanyData[]; n: number };

const MenuItemCompany: Component<PropsMenuItemCompany> = (
  props,
): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  const navigate = useNavigate();

  const handleListClick = (evt: Event) => {
    evt.stopPropagation();
    setOpen((prev: boolean) => !prev);
  };

  const handleCompanyClick = (id: number) => {
    if (!id) {
      return;
    }
    navigate(`/company/${id}`);
  };

  createEffect(() => {
    console.log('menuitem', props.data.state);
    const err = props.data.error;
    if (err) {
      if (err instanceof HttpError) {
        if (err.response.status === 401) {
          throw err;
        }
      }
      console.log('catched', err);
      toast.custom(<Alert severity="error">{err.message}</Alert>);
    }
  });

  // this derivated signal is run only on ready side, see JSX bellow
  // when drawer is open()
  // but the memo runs its immediatly because
  // 1) props.data.state start with "pending"
  // 2) it changes to "ready" or "errored"
  //  so we need to guard
  const companies = createMemo(() => {
    // guard
    if (props.data.state !== 'ready') {
      return;
    }

    const info: any = props.data();
    const isObject =
      info instanceof Object && !Array.isArray(info) && info !== null;
    if (!isObject) {
      toast.custom(
        <Alert severity="error">{'cannot read data companies'}</Alert>,
      );
      return [new Error('reading error')];
    }
    const companiesFromJSON: DataCompanies = { data: [], n: 0 };
    const errorparsing = [];
    try {
      companiesFromJSON.n = 0 + info['n'];
      for (let c of info['data']) {
        const id = Number(c['id']);
        let cfromjson: any = {
          id: isNaN(id) ? undefined : id,
          longname: c['longname'],
          rn: c['rn'],
          tin: c['tin'],
        };
        const kk = Object.keys(cfromjson);
        const kkstrong = kk.filter(k => (cfromjson as any)[k] !== undefined);
        if (kk.length !== kkstrong.length) {
          cfromjson = new Error(cfromjson?.longname ?? 'error reading data');
          errorparsing.push(cfromjson.message);
        }
        companiesFromJSON.data.push(cfromjson as any);
      }
      companiesFromJSON.n = isNaN(companiesFromJSON.n)
        ? companiesFromJSON.data.length
        : companiesFromJSON.n;
    } catch (err) {
      // TODO
      return [];
    } finally {
      if (errorparsing.length) {
        console.log(errorparsing);
        const errors = errorparsing.map(err => <p>{err}</p>);
        toast.custom(<Alert severity="error">{errors}</Alert>);
      }
    }

    const { data, n } = companiesFromJSON;
    const cc = n ? data : [];
    const withoutempty = cc.filter(
      (c: any) => !(Object.keys(c).length === 0 && c.constructor === Object),
    );
    return withoutempty;
  });

  const opener: JSX.Element = (
    <ListItemButton onClick={handleListClick}>
      <ListItemIcon>
        <AssignmentIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Companies" />
      {open() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </ListItemButton>
  );

  const noCompany: JSX.Element = (
    <ListItemButton>
      <ListItemIcon>
        <ErrorIcon fontSize="small" color="warning" />
      </ListItemIcon>
      <ListItemText secondary="no company..." />
    </ListItemButton>
  );

  const errored: (hint?: string) => JSX.Element = (hint = 'not loaded...') => (
    <ListItemButton>
      <ListItemIcon>
        <ErrorIcon fontSize="small" color="error" />
      </ListItemIcon>
      <ListItemText secondary={hint} />
    </ListItemButton>
  );

  return (
    <>
      {opener}
      <Show when={open()}>
        <Switch>
          <Match when={props.data.loading}>
            <Progress size="1rem" height="auto" />
          </Match>
          <Match when={props.data.state === 'errored'}>{errored()}</Match>
          <Match when={props.data.state == 'ready'}>
            <List disablePadding dense={true}>
              <For each={companies()} fallback={noCompany}>
                {(c: CompanyData | Error) => {
                  return c instanceof Error ? (
                    errored(c.message)
                  ) : (
                    <ListItemButton onClick={[handleCompanyClick, c.id]}>
                      <ListItemText
                        secondary={c.longname}
                        sx={{ ml: '.5em' }}
                      />
                      <ListItemIcon
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          minWidth: 'auto',
                        }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </ListItemIcon>
                    </ListItemButton>
                  );
                }}
              </For>
            </List>
          </Match>
        </Switch>
      </Show>
    </>
  );
};

export default MenuItemCompany;
