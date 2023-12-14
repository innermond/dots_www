import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@suid/material';
import { SetStoreFunction, Store, createStore, produce } from 'solid-js/store';

export type AlertDialogState = {
  open: boolean;
  choosing: boolean;
  event?: SubmitEvent;
  title?: string;
  text?: string;
};

export type AlertDialogProps = {
  state: Store<AlertDialogState>;
  setState: SetStoreFunction<AlertDialogState>;
};

export const [actionAlert, setActionAlert] = createStore({
  open: false,
  choosing: false,
  event: undefined,
} as AlertDialogState);

export default function AlertDialog(props: AlertDialogProps) {
  const handleClose = (choosing: boolean) => {
    return () => {
      props.setState(
        produce((s: AlertDialogState) => {
          s.choosing = choosing;
          s.open = false;
        }),
      );
    };
  };

  return (
    <Dialog
      open={props.state.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {props.state?.title ?? 'Choose what to do next'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.state?.text ??
            'Be wise, evaluate the consequences!. The immediate action you are about to start, it can be stopped right now or be carried it out. You decide!'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose(false)}>Cancel</Button>
        <Button onClick={handleClose(true)}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}
