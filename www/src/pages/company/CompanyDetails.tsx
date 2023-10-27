import {
  onMount,
  onCleanup,
  createResource,
  createEffect,
  createMemo,
  Show,
  For,
} from 'solid-js';
import type { Component, JSX } from 'solid-js';
import { useParams } from '@solidjs/router';

import type {
  CompanyData,
  CompanyStatsData,
  DataCompanyStats,
  DataCompanies,
  CompanyDepletionData,
  DataCompanyDepletion,
} from '@/pages/company/types';
import { isDataCompanies } from '@/pages/company/types';
import { ApiError, company } from '@/lib/api';
import toasting from '@/lib/toast';
import appstate from '@/lib/app';
import { Grid, Typography, Button, Divider, Stack } from '@suid/material';
import AddIcon from '@suid/icons-material/Add';
import ListIcon from '@suid/icons-material/List';
import StatisticsCard, {
  PropsStatisticsCard,
} from '../dashboard/StatisticsCard';
import Progress from '@/components/Progress';

const { currentCompany, setCurrentCompany, setCurrentPageTitle } = appstate;

const CompanyDetails: Component = (): JSX.Element => {
  const params = useParams();
  const [companyRes] = createResource(() => params.id, company.one);
  const data = createMemo((): DataCompanies | Error | undefined => {
    if (companyRes.state === 'errored') {
      return companyRes.error;
    }

    if (companyRes.state === 'ready') {
      const inf = companyRes();
      return inf;
    }
  });

  createEffect(() => {
    if (!data()) return;

    if (!isDataCompanies(data())) {
      toasting('data we got do no represent a company');
      return;
    }

    const dcc = data() as DataCompanies;
    if (dcc.n === 0) {
      toasting('received empty data company', 'warning');
      return;
    }

    const info: CompanyData | Error = dcc.data[0];
    // error from server
    if (info instanceof ApiError) {
      if (info.response.status === 401) {
        throw info;
      }
      toasting(info.message, 'error');
      // cut it here
      return;
    } else if (info instanceof Error) {
      // error from client
      toasting(info.message, 'error');
      // cut it here
      return;
    }

    // all ok
    setCurrentCompany(info);
    updateTitle();
  });

  const updateTitle = () => {
    const n = currentCompany().longname || 'Company';
    setCurrentPageTitle(n);
  };

  const [statsRes] = createResource(() => params.id, company.stats);
  const stats = createMemo((): DataCompanyStats | Error | undefined => {
    if (statsRes.state === 'errored') {
      return statsRes.error;
    }

    if (statsRes.state === 'ready') {
      const inf = statsRes();
      return inf;
    }
  });

  const companyStats = (): CompanyStatsData | undefined => {
    if (stats() instanceof Error || !stats()) {
      return;
    }
    // here stats() must return DataCompanyStats as it have been checked for the other
    // posible cases before ( and above in lib/api.ts)
    return (stats() as DataCompanyStats).data;
  };

  createEffect(() => {
    if (!stats()) return;

    // error from server
    if (stats() instanceof ApiError) {
      const err = stats() as ApiError;
      if (err.response.status === 401) {
        throw err;
      }
      toasting(err.message, 'error');
      // cut it here
      return;
    } else if (stats() instanceof Error) {
      // error from client
      toasting((stats() as Error).message, 'error');
      // cut it here
      return;
    }
  });

  const [depletionRes] = createResource(() => params.id, company.depletion);
  const depletion = createMemo((): DataCompanyDepletion | Error | undefined => {
    if (depletionRes.state === 'errored') {
      return depletionRes.error;
    }

    if (depletionRes.state === 'ready') {
      const inf = depletionRes();
      return inf;
    }
  });

  createEffect(() => {
    if (!depletion()) return;

    // error from server
    if (depletion() instanceof ApiError) {
      const err = depletion() as ApiError;
      if (err.response.status === 401) {
        throw err;
      }
      toasting(err.message, 'error');
      // cut it here
      return;
    } else if (depletion() instanceof Error) {
      // error from client
      toasting((depletion() as Error).message, 'error');
      // cut it here
      return;
    }
  });

  onMount(updateTitle);

  onCleanup(() => {
    console.log('CompanyDetails cleaned up');
  });

  return (
    <>
      <Show when={statsRes.state === 'ready'} fallback={<Progress />}>
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} sx={{ mb: -2.25 }}>
            <Typography variant="h5">Counters</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CountActionsCard
              title="Total Deeds"
              count={companyStats()?.countDeeds.toFixed(0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CountActionsCard
              title="Total Entries"
              count={companyStats()?.countEntries.toFixed(0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CountActionsCard
              title="Total Entry Types"
              count={companyStats()?.countEntryTypes.toFixed(0)}
            />
          </Grid>
        </Grid>
      </Show>
      <Show when={depletionRes.state === 'ready'} fallback={<Progress />}>
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} sx={{ mb: -2.25 }}>
            <Typography variant="h5">Depletion</Typography>
          </Grid>
          <For
            each={(depletion() as DataCompanyDepletion).data}
            fallback={<EmptyStatisticsCard title="nothing to report" />}
          >
            {(d: CompanyDepletionData) => {
              const remained =
                (1 - d.quantityDrained / d.quantityInitial) * 100;
              const isLoss = remained < 0.1;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <StatisticsCard
                    isLoss={isLoss}
                    title={d.code}
                    count={(d.quantityInitial - d.quantityDrained).toFixed(2)}
                    percentage={remained}
                    icon="HorizontalSplit"
                  />
                </Grid>
              );
            }}
          </For>
        </Grid>
      </Show>
    </>
  );
};

const EmptyStatisticsCard: Component<PropsStatisticsCard> = (
  props,
): JSX.Element => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <StatisticsCard isLoss={false} title={props.title ?? ''} />
    </Grid>
  );
};

type PropsActions = {
  isListDisabled?: boolean;
};

const Actions: Component<PropsActions> = (props): JSX.Element => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
    >
      <Button variant="text" size="small" startIcon={<AddIcon />}>
        Add New
      </Button>
      <Button
        disabled={props?.isListDisabled}
        variant="text"
        size="large"
        startIcon={<ListIcon />}
      >
        List
      </Button>
    </Stack>
  );
};

const isLoss = (s: string | undefined): boolean => {
  const maybeNum = parseFloat(s + '');
  if (isNaN(maybeNum)) return true;
  return maybeNum <= 0;
};

const CountActionsCard: Component<PropsStatisticsCard> = (
  props,
): JSX.Element => {
  return (
    <StatisticsCard
      title={props.title}
      count={props.count}
      isLoss={isLoss(props.count)}
    >
      <Divider />
      <Actions isListDisabled={isLoss(props.count)} />
    </StatisticsCard>
  );
};

export default CompanyDetails;
