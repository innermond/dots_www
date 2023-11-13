import { For, Show } from 'solid-js';
import type { Component, JSX } from 'solid-js';

import { Grid } from '@suid/material';
import Skeleton from '@suid/material/Skeleton';

type PropsSkeletonCounts = {
  num: number;
  height?: string;
  titleless?: boolean;
};

const SkeletonCounts: Component<PropsSkeletonCounts> = (props): JSX.Element => {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Show when={!props.titleless}>
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Skeleton width="10rem" variant="text" />
        </Grid>
      </Show>
      <For each={new Array(props.num)}>
        {_ => {
          return (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Skeleton
                width="100%"
                height={props?.height ?? '7rem'}
                variant="rectangular"
              />
            </Grid>
          );
        }}
      </For>
    </Grid>
  );
};

export default SkeletonCounts;
