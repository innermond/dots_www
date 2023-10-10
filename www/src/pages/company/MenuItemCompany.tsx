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
import {HttpError} from '../../lib/api';

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
        console.log('catched', err);
        toast.custom(<Alert severity="error">{err.message}</Alert>);
      }
    }
  })

  // this derivated signal is run only on ready side, see JSX bellow
  const companies = () => {
    const info: any = props.data();
    // TODO
    if (info instanceof Error) {
      throw info;
    }

    const companiesFromJSON: DataCompanies = { data: [], n: 0 };
    try {
      companiesFromJSON.n = 0 + info['n'];
      for (let c of info['data']) {
        companiesFromJSON.data.push({
          id: 0 + c['id'],
          longname: '' + c['longname'],
          rn: '' + c['rn'],
          tin: '' + c['tin'],
        });
      }
    } catch (err) {
      // TODO
      return [];
    }

    const { data, n } = companiesFromJSON;
    const cc = n ? data : [];
    const withoutempty = cc.filter(
      (c: any) => !(Object.keys(c).length === 0 && c.constructor === Object),
    );
    return withoutempty;
  };

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
        <ListItemIcon >
          <ErrorIcon fontSize="small" color="warning" />
        </ListItemIcon>
        <ListItemText secondary="no company..." />
      </ListItemButton>
  ); 

  const errored: JSX.Element = (
      <ListItemButton>
        <ListItemIcon >
          <ErrorIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText secondary="not loaded..." />
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
          <Match when={props.data.state === 'errored'}>
            {errored}
          </Match>
          <Match when={props.data.state == 'ready'}>
            <List disablePadding dense={true}>
              <For each={companies()} fallback={noCompany}>
                {(c: CompanyData) => {
                  return (
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
