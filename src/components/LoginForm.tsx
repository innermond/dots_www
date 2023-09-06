import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { Button, Backdrop } from '@suid/material';

const LoginForm: Component = () => {
  const [open, setOpen] = createSignal(false);
  const openBackdrop = () => setOpen(true);
  const closeBackdrop = () => setOpen(false);

  return (
  <>
    <Button 
      onClick={openBackdrop}
    >
    {open() ? 'opened' : 'closed'}
    </Button>

    <Backdrop open={open()} onClick={closeBackdrop}></Backdrop>
    </>
  );
};

export default LoginForm;
