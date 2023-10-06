import { JSX, Component, Show, createSignal } from 'solid-js';
import AssignmentIcon from '@suid/icons-material/Assignment';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import {
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from '@suid/material';
import { useNavigate } from '@solidjs/router';

const MenuItemCompany: Component = (): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  const navigate = useNavigate();

  const handleClick = (evt: Event) => {
    evt.stopPropagation();
    setOpen(prev => !prev);
  };

  const handleCompanyClick = () => {
    navigate('/company/3');
    setTimeout(() => setOpen(false), 0);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <AssignmentIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Companies" />
        {open() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItemButton>
      <Show when={open()}>
        <List disablePadding>
          <ListItemButton onClick={handleCompanyClick}>
            <ListItemIcon></ListItemIcon>
            <ListItemText secondary="Volt-media" />
          </ListItemButton>
        </List>
      </Show>
    </>
  );
};

export default MenuItemCompany;
