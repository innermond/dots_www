import { Box, Chip, Grid, Stack, Typography } from '@suid/material';
import MainCard from '@/components/MainCard';

import { mergeProps, Show, createMemo } from 'solid-js';
import type { Component } from 'solid-js';
import TrendingUp from '@suid/icons-material/TrendingUp';
import TrendingDown from '@suid/icons-material/TrendingDown';
import { ChipTypeMap } from '@suid/material/Chip';

type CardColor = ChipTypeMap['selfProps']['color'];

type PropsStatisticsCard = Partial<{
  color: CardColor;
  title: string;
  count: string;
  percentage: number;
  isLoss: boolean;
  extra: any;
}>;

const defaultPropsStatisticsCard = {
  color: 'primary' as CardColor,
};

const StatisticsCard: Component<PropsStatisticsCard> = props => {
  props = mergeProps(defaultPropsStatisticsCard, props);

  const colorByIsLoss = createMemo(() =>
    props.isLoss ? 'warning' : props.color,
  );

  return (
    <MainCard>
      <Stack spacing={0.5}>
        <Typography variant="h6" color="textSecondary">
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
                color={colorByIsLoss()}
                icon={
                  <Show
                    when={props.isLoss}
                    fallback={<TrendingUp style={{ color: 'inherit' }} />}
                  >
                    <TrendingDown style={{ color: 'inherit' }} />
                  </Show>
                }
                label={`${props.percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
              />
            </Grid>
          </Show>
        </Grid>
      </Stack>
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
    </MainCard>
  );
};

export default StatisticsCard;
