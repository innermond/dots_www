import {
  JSX,
  Component,
  Show,
  createSignal,
  For,
  Switch,
  Resource,
  Match,
  ErrorBoundary,
  createEffect,
} from 'solid-js';
import AssignmentIcon from '@suid/icons-material/Assignment';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';
import {
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from '@suid/material';
import { Navigate, useNavigate } from '@solidjs/router';
import { CompanyData, companyZero } from './types';
import Progress from '../../components/Progress';

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
    setTimeout(() => setOpen(false), 0);
  };

  createEffect(() => {
    console.log('menuitem', props.data.state);
  })

  const noCompany = { ...companyZero, longname: 'no company' };
  const companies = () => {
    if (props.data.state !== 'ready') {
      return [];
    }

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
    return withoutempty.length ? withoutempty : [noCompany];
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

  return (
    <>
      {opener}
      <Show when={open()}>
        <Switch>
          <Match when={props.data.loading}>
            <Progress size="1rem" height="auto" />
          </Match>
          <Match when={props.data.state === 'errored'}>
            <Navigate href="/login" />
          </Match>
          <Match when={props.data.state == 'ready'}>
            <List disablePadding dense={true}>
              <For each={companies()}>
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