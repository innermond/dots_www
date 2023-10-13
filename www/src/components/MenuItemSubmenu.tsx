import {
  JSX,
  Show,
  createSignal,
  For,
  Switch,
  Resource,
  Match,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import LabelIcon from '@suid/icons-material/Label';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';
import ErrorIcon from '@suid/icons-material/Error';
import RefreshIcon from '@suid/icons-material/Refresh';
import {
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  SvgIcon,
  IconButton,
} from '@suid/material';
import { SvgIconTypeMap } from '@suid/material/SvgIcon';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

import Progress from './Progress';

type DataMenuItemSubmenu<T> = Array<Error | T> | Error | undefined;

type PropsMenuItemSubmenu<T> = {
  icon?: typeof SvgIcon;
  headtext: string;
  data?: DataMenuItemSubmenu<T>;
  state: Resource<T>['state'];
  idkey?: string;
  titlekey?: string;
  refresh?: Function;
};

type SvgIconColor = SvgIconTypeMap['selfProps']['color'];

function MenuItemSubmenu<T>(props: PropsMenuItemSubmenu<T>): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const navigate = useNavigate();

  const handleListClick = (evt: Event) => {
    evt.stopPropagation();
    setOpen((prev: boolean) => !prev);
  };

  const idkey = props?.idkey ?? 'id';
  const titlekey = props?.titlekey ?? 'name';
  const icon = props?.icon ?? LabelIcon;
  const refresh = (evt: Event) => {
    evt.stopPropagation();
    toast.remove();

    const fn = props?.refresh ?? (() => {});
    fn();
  }

  const handleSubmenuClick = (id: number) => {
    if (!id) {
      return;
    }
    navigate(`/company/${id}`);
  };

  const opener: JSX.Element = (
    <ListItemButton onClick={handleListClick}>
      <ListItemIcon>
        <Dynamic
          component={icon}
          color={props.state === 'errored' ? 'error' : 'inherit'}
          fontSize="small"
        />
      </ListItemIcon>
      <ListItemText primary={props.headtext} />
      {open() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </ListItemButton>
  );

  const errored: (hint?: string, color?: SvgIconColor) => JSX.Element = (
    hint = 'not loaded...',
    color = 'error',
  ) => {
    return (
      <ListItemButton>
        <ListItemIcon>
          <ErrorIcon fontSize="small" color={color} />
        </ListItemIcon>
        <ListItemText secondary={hint} />
        <IconButton
          onClick={refresh}
          size="small"
          color="primary"
          aria-label="refresh entire list"
        >
          <RefreshIcon />
        </IconButton>
      </ListItemButton>
    );
  };

  const noSubmenu: JSX.Element = errored('no company...', 'warning');

  return (
    <>
      {opener}
      <Show when={open()}>
        <Switch>
          <Match when={['pending', 'refreshing'].includes(props.state)}>
            <Progress padding="0.5rem" size="1rem" height="auto" />
          </Match>
          <Match when={props.state === 'errored'}>
            <List disablePadding dense={true}>
              {errored()}
            </List>
          </Match>
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
}

export default MenuItemSubmenu;
