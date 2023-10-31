import { createStore } from 'solid-js/store';
import type { CompanyData } from '../pages/company/types';
import { companyZero } from '../pages/company/types';

type AppState = {
  currentPageTitle: string;
  currentCompany: CompanyData;
};

const appStateZero = {currentPageTitle: '...', currentCompany: companyZero};

const state = createStore<AppState>(appStateZero);

export default state;
