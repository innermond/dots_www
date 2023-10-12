import {
  JSX,
  Show,
  createSignal,
  For,
  Switch,
  Resource,
  Match,
  createEffect,
} from 'solid-js';
import { Dynamic } from "solid-js/web";

import LabelIcon from '@suid/icons-material/Label';
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
  SvgIcon,
} from '@suid/material';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

import Progress from './Progress';
import { ApiError } from '../lib/api';

type DataMenuItemSubmenu<T> = Array<Error | T> | Error | undefined;

type PropsMenuItemSubmenu<T> = {
  icon?: typeof SvgIcon,
  headtext: string, 
  data?: DataMenuItemSubmenu<T>,
  state: Resource<T>['state'],
  idkey?: string,
  titlekey?: string,
};

function MenuItemSubmenu<T>( props: PropsMenuItemSubmenu<T> ): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const navigate = useNavigate();

  const handleListClick = (evt: Event) => {
    evt.stopPropagation();
    setOpen((prev: boolean) => !prev);
  };

  const idkey = props?.idkey ?? 'id';
  const titlekey = props?.titlekey ?? 'name';
  const icon = props?.icon ?? LabelIcon;

  const handleSubmenuClick = (id: number) => {
    if (!id) {
      return;
    }
    navigate(`/company/${id}`);
  };

  createEffect(() => {
    console.log('menuitem', props.state);
    if (props.state !== 'errored') {
      return;
    }
    const err = props.data as Error;
    if (err) {
      if (err instanceof ApiError) {
        if (err.response.status === 401) {
          throw err;
        }
      }
      console.log('catched', err);
      toast.custom(<Alert severity="error">{err.message}</Alert>);
    }
  });

  const opener: JSX.Element = (
    <ListItemButton onClick={handleListClick}>
      <ListItemIcon>
        <Dynamic component={icon} color={props.state === 'errored' ? 'error' : 'inherit'} fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={props.headtext} />
      {open() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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

  const noSubmenu: JSX.Element = errored('no company...');

  return (
    <>
      {opener}
      <Show when={open()}>
        <Switch>
          <Match when={props.state === "pending"}>
            <Progress padding="0.5rem" size="1rem" height="auto" />
          </Match>
          <Match when={props.state === 'errored'}>{errored()}</Match>
          <Match when={props.state == 'ready'}>
            <List disablePadding dense={true}>
              <For each={props.data as any} fallback={noSubmenu}>
                {(c: any) => {
                  return c instanceof Error ? (
                    errored(c.message)
                  ) : (
                    <ListItemButton onClick={[handleSubmenuClick, c[idkey]]}>
                      <ListItemText
                        secondary={c[titlekey]}
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

export default MenuItemSubmenu;
