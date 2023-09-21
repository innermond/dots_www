import { createStore } from 'solid-js/store';

type ValidablePair = {element: HTMLElement, validators: Function[] | Function};
type Validables = {[key: string]: ValidablePair};

export function useForm() {
  const [errors, setErrors] = createStore({});
  const fields: Validables = {};

  const validate = (ref: HTMLFormElement, accessor: Function): void => {
    const accessedFn = accessor();
    const validators = Array.isArray(accessedFn) ? accessedFn : [accessedFn];

    if (!ref?.name) return;
    ref.onblur = () => console.log("blur", ref.name);
    ref.oninput = () => console.log("input", ref?.value);

    fields[ref.name] = {element: ref, validators};
  };

  return {validate};
}
