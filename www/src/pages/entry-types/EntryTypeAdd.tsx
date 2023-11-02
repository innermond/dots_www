import {
  ListItem,
  ListItemText,
  ListItemButton,
  List,
  Divider,
} from "@suid/material";
import {JSX} from "solid-js";

export default function EntryTypeAdd(props: any): JSX.Element {
  return (
        <List>
          <ListItem disableGutters disablePadding>
            <ListItemButton>
              <ListItemText primary="Phone ringtone" secondary="Titania" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disableGutters disablePadding>
            <ListItemButton>
              <ListItemText
                primary="Default notification ringtone"
                secondary="Tethys"
              />
            </ListItemButton>
          </ListItem>
        </List>
  );
}
