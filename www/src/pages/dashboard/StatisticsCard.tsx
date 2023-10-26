import {
  Box,
  Chip,
  Grid,
  Stack,
  SvgIcon,
  Typography,
} from '@suid/material';
import MainCard from '@/components/MainCard';

import { mergeProps, Show, createMemo, lazy } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { Component } from 'solid-js';
import TrendingUp from '@suid/icons-material/TrendingUp';
import TrendingDown from '@suid/icons-material/TrendingDown';
import { SxProps } from '@suid/system';
import { ChipTypeMap } from '@suid/material/Chip';

type CardColor = ChipTypeMap['selfProps']['color'];

type PropsStatisticsCard = Partial<{
  color: CardColor;
  title: string;
  count: string;
  percentage: number;
  icon?: typeof SvgIcon | string;
  isLoss: boolean;
  extra: any;
}>;

const defaultPropsStatisticsCard = {
  color: 'primary' as CardColor,
};

const ellipsisStyle: SxProps = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontSize: '1rem',
};

const loadIcon: any = (iconstr: string) => {
  return lazy(() => import(`../../../node_modules/@suid/icons-material/${iconstr}.jsx`));
};

const StatisticsCard: Component<PropsStatisticsCard> = props => {
  props = mergeProps(defaultPropsStatisticsCard, props);

  const otherIcon = ():typeof SvgIcon | null  => {
    if (typeof props?.icon === 'string') {
      return loadIcon(props.icon)
    } else if (!!props?.icon) {
      return props.icon;
    }
    return null;
  };

  const dynIcon = otherIcon();

  const colorByIsLoss = createMemo(() =>
    props.isLoss ? 'warning' : props.color,
  );

  return (
    <MainCard>
      <Stack spacing={0.5}>
        <Typography
          variant="h6"
          color="text.secondary"
          title={props.title}
          sx={ellipsisStyle}
        >
          {props.title}
        </Typography>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {props.count}
            </Typography>
          </Grid>
          <Show when={props.percentage}>
            <Grid item>
              <Chip
                variant="outlined"
                color={props.color ?? colorByIsLoss()}
                icon={
                  <Show
                    when={props.isLoss}
                    fallback={dynIcon ? <Dynamic component={dynIcon} />: <TrendingUp style={{ color: 'inherit' }} />}
                  >
                    {dynIcon ? <Dynamic component={dynIcon} /> : <TrendingDown style={{ color: 'inherit' }} />}
                  </Show>
                }
                label={`${props.percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
              />
            </Grid>
          </Show>
        </Grid>
      </Stack>
      <Show when={props.extra}>
        <Box sx={{ pt: 2.25 }}>
          <Typography variant="caption" color="textSecondary">
            You made an extra{' '}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: `${colorByIsLoss()}.main` }}
            >
              {props.extra}
            </Typography>{' '}
            this year
          </Typography>
        </Box>
      </Show>
    </MainCard>
  );
};

export default StatisticsCard;
