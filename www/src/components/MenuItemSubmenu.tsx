import {
  JSX,
  Show,
  createSignal,
  createEffect,
  For,
  Switch,
  Resource,
  Match,
  onMount,
  onCleanup,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import LabelIcon from '@suid/icons-material/Label';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import ChevronRightIcon from '@suid/icons-material/ChevronRight';
import ErrorIcon from '@suid/icons-material/Error';
import RefreshIcon from '@suid/icons-material/Refresh';
import {
  Box,
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  SvgIcon,
  IconButton,
} from '@suid/material';
import { SvgIconTypeMap } from '@suid/material/SvgIcon';

import Progress from './Progress';

type DataMenuItemSubmenu<T> = Array<Error | T> | Error | undefined;

type PropsMenuItemSubmenu<T> = {
  icon?: typeof SvgIcon;
  headtext: string;
  data?: DataMenuItemSubmenu<T>;
  state: Resource<T>['state'];
  titlekey?: keyof T;
  action?: NonNullable<Function>;
};

type SvgIconColor = SvgIconTypeMap['selfProps']['color'];

function MenuItemSubmenu<T>(props: PropsMenuItemSubmenu<T>): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const [animationDone, setAnimationDone] = createSignal(false);

  const handleListClick = (evt: Event) => {
    evt.stopPropagation();
    setOpen((prev: boolean) => !prev);
  };

  const titlekey = props?.titlekey ?? 'name';
  const icon = props?.icon ?? LabelIcon;

  const handleSubmenuClick = (e: unknown) => {
    if (!e) {
      return;
    }
    if (!props.action) return;
    props.action(e);
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

  const handleRefresh = (evt: Event) => {
    evt.stopPropagation();
    const e = new CustomEvent('refetchItem', { bubbles: true });
    evt.currentTarget?.dispatchEvent(e);
  };

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
          onClick={handleRefresh}
          size="small"
          color="primary"
          aria-label="refresh entire list"
        >
          <RefreshIcon />
        </IconButton>
      </ListItemButton>
    );
  };

  const noSubmenu: JSX.Element = errored('no item...', 'warning');

  let itemsSubmenuRef: HTMLDivElement | undefined;
  let itemsListRef: HTMLUListElement | undefined;

  const contractAnimation = {
    height: 0,
    overflow: 'hidden',
    transition: 'height .3s ease',
  };
  const contract = (evt: Event) => {
    if (itemsSubmenuRef !== evt.target) return;
    if (itemsSubmenuRef.clientHeight === 0) setAnimationDone(true);
  };

  onMount(() => {
    document.addEventListener('transitionend', contract);
    onCleanup(() => document.removeEventListener('transitionend', contract));
  });

  createEffect(() => {
    if (open()) {
      setAnimationDone(false);
      // gives time for submenu to be attached
      // as drawer is temporary and builds/removes its content
      setTimeout(
        () =>
          (itemsSubmenuRef!.style.height = getComputedStyle(
            itemsListRef!,
          ).height),
        0,
      );
    } else {
      if (itemsSubmenuRef?.isConnected) {
        itemsSubmenuRef.style.height = '0px';
      }
    }
  });

  return (
    <>
      {opener}
      <Show when={!animationDone()}>
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
            <Box ref={itemsSubmenuRef} sx={contractAnimation}>
              <List ref={itemsListRef} disablePadding dense={true}>
                <For each={props.data as any} fallback={noSubmenu}>
                  {(d: unknown) => {
                    return d instanceof Error ? (
                      errored(d.message)
                    ) : (
                      <ListItemButton onClick={[handleSubmenuClick, d]}>
                        <ListItemText
                          secondary={(d as any)[titlekey]}
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
            </Box>
          </Match>
        </Switch>
      </Show>
    </>
  );
}

export default MenuItemSubmenu;
