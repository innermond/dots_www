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
import { Show } from 'solid-js';

import type { ActionButtonProps } from '@/components/ActionButton';
import ActionButton from '@/components/ActionButton';
import { dispatch } from '@/lib/customevent';

const theme = useTheme();

const EVENT_ACTIONBAR_ACTIONBAR_CLOSE = 'dots:actionbar:close',
  EVENT_ACTIONBAR_ACTIONBAR_STOP = 'dots:actionbar:stop',
  EVENT_ACTIONBAR_ACT = 'dots:actionbar:act';

//output specific events that are intented to be handled by client code
const handleClose = () => dispatch(EVENT_ACTIONBAR_ACTIONBAR_CLOSE),
  handleStop = () => dispatch(EVENT_ACTIONBAR_ACTIONBAR_STOP),
  handleAct = () => dispatch(EVENT_ACTIONBAR_ACT);

type ActionProp = {
  show: boolean;
  disabled: boolean;
  text: string;
  color: ButtonProps['color'];
  kind: ActionButtonProps['kind'];
};
type ActionBarProps = {
  title: string;
  close: ActionProp;
  reset: ActionProp;
  stop: ActionProp;
  act: ActionProp;
};

const ActionBar = (props: ParentProps<ActionBarProps>) => (
  <AppBar
    color="transparent"
    sx={{ position: 'relative', mt: theme.spacing(1) }}
  >
    <Toolbar sx={{ pr: 0 }}>
      <IconButton
        edge="start"
        color="inherit"
        onClick={handleClose}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
      <Typography
        sx={{
          ml: 2,
          flex: 1,
        }}
        variant="h5"
        component="div"
      >
        {props.title}
      </Typography>
      <Show when={props.stop.show}>
        <ActionButton
          text={props.stop.text}
          only="text"
          type="button"
          color="error"
          size="small"
          onClick={handleStop}
          disabled={props.stop.disabled}
        />
      </Show>
      <Show when={props.reset.show}>
        <ActionButton
          text={props.reset.text}
          kind="reset"
          only="text"
          type="reset"
          color="error"
          size="small"
          disabled={props.reset.disabled}
        />
      </Show>
      <ActionButton
        text={props.act.text}
        color={props.act.color}
        disabled={props.act.disabled}
        kind={props.act.kind}
        onClick={handleAct}
      />
      {props.children}
    </Toolbar>
    <Divider />
  </AppBar>
);

export default ActionBar;
