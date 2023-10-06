import { createSignal, createRoot } from 'solid-js';
import type { Accessor, Setter } from 'solid-js';
import type { CompanyData } from '../pages/company/types'; 
import { companyZero } from '../pages/company/types'; 

const [ currentPageTitle, setCurrentPageTitle ] = createSignal<string>("");
const [ currentCompany, setCurrentCompany ] = createSignal<CompanyData>(companyZero);

type AppState = {
  currentPageTitle: Accessor<string>,
  setCurrentPageTitle: Setter<string>,
  currentCompany: Accessor<CompanyData>,
  setCurrentCompany: Setter<CompanyData>,
};

const state =  createRoot((): AppState => ({
  currentPageTitle,
  setCurrentPageTitle,
  currentCompany,
  setCurrentCompany,
}));

export default state;
