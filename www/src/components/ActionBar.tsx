import type { ButtonProps } from '@suid/material/Button';
import CloseIcon from '@suid/icons-material/Close';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  useTheme,
} from '@suid/material';

import type { ParentProps } from 'solid-js';
import { Show, mergeProps } from 'solid-js';

import type { ActionButtonProps } from '@/components/ActionButton';
import ActionButton from '@/components/ActionButton';

const theme = useTheme();

type ActionBarProp = Partial<{
  show: boolean;
  disabled: boolean;
  text: string;
  color: ButtonProps['color'];
  kind: ActionButtonProps['kind'];
}>;
type ActionBarProps = {
  title: string;
  close: ActionBarProp;
  reset: ActionBarProp;
  stop: ActionBarProp;
  act: ActionBarProp;
  onClose?: EventListener;
  onReset?: EventListener;
  onStop?: EventListener;
  onAct?: EventListener;
};

const ActionBar = (props: ParentProps<ActionBarProps>) => {
  const initial = {
    close: { show: true, disabled: false, color: 'inherit' },
    reset: { show: true, disabled: true, text: 'reset', kind: 'reset' },
    stop: { show: false, disabled: false, text: 'stop', color: 'error' },
    act: { show: true, disabled: false, text: 'do' },
  };
  const my = mergeProps(initial, props);

  return (
    <AppBar
      color="transparent"
      sx={{ position: 'relative', mt: theme.spacing(1) }}
    >
      <Toolbar sx={{ pr: 0 }}>
        <Show when={my.close.show}>
          <IconButton
            edge="start"
            color={my.close.color}
            disabled={my.close.disabled}
            onClick={my.onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Show>
        <Typography
          sx={{
            ml: 2,
            flex: 1,
          }}
          variant="h5"
          component="div"
        >
          {my.title}
        </Typography>
        <Show when={my.stop.show}>
          <ActionButton
            text={my.stop.text}
            only="text"
            type="button"
            color="error"
            size="small"
            onClick={my.onStop}
            disabled={my.stop.disabled}
          />
        </Show>
        <Show when={my.reset.show}>
          <ActionButton
            text={my.reset.text}
            kind="reset"
            only="text"
            type="reset"
            color="error"
            size="small"
            onClick={my.onReset}
            disabled={my.reset.disabled}
          />
        </Show>
        <ActionButton
          text={my.act.text}
          color={my.act.color}
          disabled={my.act.disabled}
          kind={my.act.kind}
          onClick={my.onAct}
        />
        {my.children}
      </Toolbar>
      <Divider />
    </AppBar>
  );
};

export type { ActionBarProps, ActionBarProp };
export default ActionBar;
