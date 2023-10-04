import { createSignal, createRoot } from 'solid-js';

const [ currentPageTitle, setCurrentPageTitle ] = createSignal<string>("");

const state =  createRoot(() => ({currentPageTitle, setCurrentPageTitle}));

export default state;
