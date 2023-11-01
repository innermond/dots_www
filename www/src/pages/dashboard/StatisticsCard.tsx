import {
  Box,
  Chip,
  Grid,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from '@suid/material';
import MainCard from '@/components/MainCard';

import { mergeProps, Show, createMemo, lazy } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { ParentComponent } from 'solid-js';
import TrendingUp from '@suid/icons-material/TrendingUp';
import TrendingDown from '@suid/icons-material/TrendingDown';
import { SxProps } from '@suid/system';
import { ChipTypeMap } from '@suid/material/Chip';

type CardColor = ChipTypeMap['selfProps']['color'];

export type PropsStatisticsCard = Partial<{
  color: CardColor;
  title: string;
  count: string;
  percentage: number;
  icon?: typeof SvgIcon | string;
  isLoss: boolean;
}>;

const defaultPropsStatisticsCard = {
  color: 'primary' as CardColor,
};

const ellipsisStyle: SxProps = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

const loadIcon: any = (iconstr: string) => {
  return lazy(
    () => import(`../../../node_modules/@suid/icons-material/${iconstr}.jsx`),
  );
};

const theme = useTheme();

const StatisticsCard: ParentComponent<PropsStatisticsCard> = props => {
  props = mergeProps(defaultPropsStatisticsCard, props);

  const otherIcon = (): typeof SvgIcon | null => {
    if (typeof props?.icon === 'string') {
      return loadIcon(props.icon);
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
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography
          variant="h6"
          color="text.secondary"
          title={props.title}
          sx={ellipsisStyle}
        >
          {props.title}
        </Typography>
        <Stack direction="row" alignItems="center">
          <Show when={props.count}>
            <Grid item>
              <Typography variant="h4" color="inherit">
                {props.count}
              </Typography>
            </Grid>
          </Show>
          <Show when={props.percentage}>
            <Grid item>
              <Chip
                size="small"
                color={colorByIsLoss()}
                icon={
                  <Show
                    when={props.isLoss}
                    fallback={
                      dynIcon ? (
                        <Dynamic component={dynIcon} />
                      ) : (
                        <TrendingUp style={{ color: 'inherit' }} />
                      )
                    }
                  >
                    {dynIcon ? (
                      <Dynamic component={dynIcon} />
                    ) : (
                      <TrendingDown style={{ color: 'inherit' }} />
                    )}
                  </Show>
                }
                label={`${props.percentage!.toFixed(2)}%`}
                sx={{ ml: theme.spacing(1) }}
              />
            </Grid>
          </Show>
        </Stack>
      </Grid>
      <Show when={props.children}>
        <Box>{props.children}</Box>
      </Show>
    </MainCard>
  );
};

export default StatisticsCard;
