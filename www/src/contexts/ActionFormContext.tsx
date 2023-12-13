import { useContext, ParentProps } from 'solid-js';
import { SetStoreFunction, Store, createStore } from 'solid-js/store';

import type { MessagesMap, Validable, Validators } from '@/lib/form';
import { makeValidable, validate } from '@/lib/form';
import { createContext } from 'solid-js';

export type ActionFormContextProps<T> = {
  initialInputs: T;
};

export type ActionFormContextState<T> = {
  // action form
  open: boolean;
  initials: T;
  // validable values
  inputs: Validable<T>;
  // abort action
  cut: boolean;
  askMeBeforeAction: boolean;

  // action bar
  show: {
    reset: boolean;
    stop: boolean;
    action: boolean;
  };
  ready: boolean;
  result?: T;
};

export type ActionFormContextValue<T> = {
  actionFormState: Store<ActionFormContextState<T>>;
  setActionFormContextState: SetStoreFunction<ActionFormContextState<T>>;
  validateInputUpdateStore: Function; // TODO: weak type, sort of "any"
  makeHandleChange: (
    validators: Validators<T>,
    messages: MessagesMap<T>,
  ) => (evtOrname: object | string, value: any) => void;
};

const ActionFormContext = createContext();

// T is typeof data to be sent
const ActionFormProvider = <T extends {}>(
  props: ParentProps<ActionFormContextProps<T>>,
) => {
  const names = Object.keys(props.initialInputs);

  let defaultInputs: Validable<typeof props.initialInputs>;
  try {
    defaultInputs = makeValidable(props.initialInputs, ...names);
  } catch (err) {
    console.log((err as any).error);
    return;
  }

  // initial state
  const initialState = {
    open: true,
    initials: props.initialInputs,
    inputs: defaultInputs,
    cut: false,
    askMeBeforeAction: false,

    show: { reset: true, stop: false, action: true },
    ready: false,
    result: undefined,
  } as ActionFormContextState<T>;

  const [state, setState] = createStore(initialState);

  // validate named fields and then
  // update the local inputs store
  const validateInputUpdateStore = (
    data: unknown,
    skipValidation: boolean = false,
    validators: Validators<T>,
    messages: MessagesMap<T>,
    names: string[] = [],
  ): void => {
    const hasNameValue = 'name' in (data as any) && 'value' in (data as any);
    if (!hasNameValue) {
      return;
    }

    type KeyValfromT = { name: keyof T; value: T[typeof name] };
    const { name, value } = data as KeyValfromT;

    if (!!names && !names?.includes(name as string)) return;

    const errorstr: string = skipValidation
      ? ''
      : validate(name as string, value, validators, messages);
    const v = {
      value: value as T[keyof T],
      error: errorstr.length > 0,
      message: errorstr,
    };
    setState('inputs', (prev: Validable<T>) => ({ ...prev, [name]: v }));
  };

  // utility to help form's inputs be controlled components
  const makeHandleChange =
    (validators: Validators<T>, messages: MessagesMap<T>) =>
    (evtOrname: object | string, value: any) => {
      let name: string;
      if (typeof evtOrname === 'object') {
        if (!('target' in evtOrname && 'name' in (evtOrname.target as any))) {
          return;
        }
        name = (evtOrname.target as any)!.name;
      } else if (typeof evtOrname === 'string') {
        name = evtOrname;
      } else {
        // TODO maybe throw?
        return;
      }

      validateInputUpdateStore(
        { name, value },
        false,
        validators,
        messages,
        names,
      );
    };

  const form: ActionFormContextValue<T> = {
    actionFormState: state,
    setActionFormContextState: setState,
    validateInputUpdateStore,
    makeHandleChange,
  };

  return (
    <ActionFormContext.Provider value={form}>
      {props.children}
    </ActionFormContext.Provider>
  );
};

export function useActionForm() {
  return useContext(ActionFormContext);
}

export default ActionFormProvider;
