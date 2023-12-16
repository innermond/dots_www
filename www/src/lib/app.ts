import { createStore } from 'solid-js/store';
import type { CompanyData } from '../pages/company/types';
import { companyZero } from '../pages/company/types';

type AppState = {
  currentPageTitle: string;
  currentCompany: CompanyData;
};

const appStateZero = { currentPageTitle: '...', currentCompany: companyZero };

const state = createStore<AppState>(appStateZero);

// https://medium.com/@pancemarko/deep-equality-in-javascript-determining-if-two-objects-are-equal-bf98cf47e934
const isDeepEqual = (a: unknown, z: unknown): boolean => {
  if (a === z) return true;

  if (Array.isArray(a) && Array.isArray(z)) {
    if (a.length !== z.length) {
      return false;
    }

    return a.every((elem, index) => {
      return isDeepEqual(elem, z[index]);
    });
  }

  if (
    typeof a === 'object' &&
    typeof z === 'object' &&
    a !== null &&
    z !== null
  ) {
    if (Array.isArray(a) || Array.isArray(z)) {
      return false;
    }

    const keys1 = Object.keys(a);
    const keys2 = Object.keys(z);

    if (
      keys1.length !== keys2.length ||
      !keys1.every(key => keys2.includes(key))
    ) {
      return false;
    }

    for (let key in a) {
      let isEqual = isDeepEqual(
        a[key as keyof typeof a],
        z[key as keyof typeof z],
      );
      if (!isEqual) {
        return false;
      }
    }

    return true;
  }

  return false;
};

export { isDeepEqual };
export default state;
