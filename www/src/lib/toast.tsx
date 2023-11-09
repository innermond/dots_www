import type { JSX } from 'solid-js';
import { Alert } from '@suid/material';
import { AlertColor } from '@suid/material/Alert/AlertProps';
import { toast } from 'solid-toast';

const toasting = (message: string | JSX.Element, severity?: AlertColor) => {
  if (!!severity) {
    severity = 'info';
  }

  toast.custom(
    t => (
      <Alert onClick={() => toast.dismiss(t.id)} severity={severity}>
        {message}
      </Alert>
    ),
    {
      duration: 6000,
      unmountDelay: 0,
    },
  );
};

toasting.remove = toast.remove.bind(toast);
toasting.dismiss = toast.dismiss.bind(toast);

export default toasting;
