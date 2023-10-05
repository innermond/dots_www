import DashboardIcon from '@suid/icons-material/Dashboard';
import AssignmentIcon from '@suid/icons-material/Assignment';
import HeartBrokenOutlinedIcon from '@suid/icons-material/HeartBrokenOutlined';
import SvgIcon from '@suid/material/SvgIcon';

type Item = null|string|{[key: string]: [typeof SvgIcon, string]}
const items: Item[] = [
  null,
  {
  '/': [DashboardIcon, 'Dashboard',],
  '/42': [HeartBrokenOutlinedIcon, 'Not Found',],
  },
  'Reports',
  {
  '/company': [AssignmentIcon, 'Company',],
  '/43': [HeartBrokenOutlinedIcon, 'Not Found',],
  },
];

type ItemMap = {
  (): any,
  instance?: any
};

export const getPathTitleMap: ItemMap = () => {
  if (!getPathTitleMap?.instance) {
    const out = new Map()
    items.forEach((e:Item)  => {
      if (typeof e === 'string' ||  e === null || typeof e !== 'object') {
        return;
      }

      const kk = Object.keys(e);
      for (let k of kk) {
        out.set(k, e[k][1]);
      };
    });

    getPathTitleMap.instance = out;
  }

  return getPathTitleMap.instance;
};

export default items; 
