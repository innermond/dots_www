import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@suid/material';
import { SetStoreFunction, Store } from 'solid-js/store';

export type AlertDialogState = {
  open: boolean;
  choosing: boolean;
  event?: SubmitEvent;
};

export type AlertDialogProps = {
  state: Store<AlertDialogState>;
  setState: SetStoreFunction<AlertDialogState>;
};

export default function AlertDialog(props: AlertDialogProps) {
  const handleClose = (choosing: boolean) => {
    return () => {
      props.setState('choosing', choosing);
      props.setState('open', false);
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
        {"Use Google's location service?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose(false)}>Disagree</Button>
        <Button onClick={handleClose(true)}>Agree</Button>
      </DialogActions>
    </Dialog>
  );
}
