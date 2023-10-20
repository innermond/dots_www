import { splitProps, mergeProps } from 'solid-js';
import type { Component, JSX, ParentComponent } from 'solid-js';
import { Show } from 'solid-js';

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  useTheme,
} from '@suid/material';
import { SxProps } from '@suid/system';

const headerSX: SxProps = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' },
};

type PropsMainCard = Partial<{
  border: boolean;
  content: boolean;
  contentSX: SxProps;
  elevation: number;
  secondary: any;
  sx: SxProps;
  title: string;
}>;

const defaultPropsMainCard: PropsMainCard = {
  border: true,
  content: true,
  sx: { backgroundColor: '#fff', borderColor: '#ddd' },
};

const MainCard: ParentComponent<PropsMainCard> = props => {
  const theme = useTheme();
  props = mergeProps(defaultPropsMainCard, props);
  const [, others] = splitProps(props, [
    'border',
    'content',
    'contentSX',
    'elevation',
    'secondary',
    'sx',
    'title',
  ]);

  return (
    <Card
      elevation={props.elevation ?? 0}
      {...others}
      sx={{
        border: props.border ?? false ? '1px solid' : 'none',
        borderRadius: 2,
        '& pre': {
          m: 0,
          p: '16px !important',
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
        },
        ...props.sx,
      }}
    >
      <Show when={props.title}>
        <CardHeader
          sx={headerSX}
          title={<Typography variant="h3">{props.title}</Typography>}
          action={props.secondary}
        />
      </Show>
      <Show when={props.content ?? true}>
        <CardContent sx={props.contentSX}>{props.children}</CardContent>
      </Show>
    </Card>
  );
};

export default MainCard;
