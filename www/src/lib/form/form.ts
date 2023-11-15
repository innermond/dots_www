type Validable<T extends string> = {
  [key in T]: Validation;
};

type Validation = {
  value: any;
  error: boolean;
  message: string;
};

type FuncWithArgs = Func & { args: object };
type Func = (...params: any) => boolean;
type Validator = Func | FuncWithArgs;

type Validators<T extends string> = {
  [key in T as string]: Validator[];
};

type MessagesMap<T extends string> = {
  [key in T as string]: Messages;
};
type Messages = Array<(...params: any) => string>;

type InnerValidation<T extends string> = {
  validators: Validators<T>;
  messages: MessagesMap<T>;
};

function validate<T extends string>(
  name: string,
  value: any,
  validators: Validators<T>,
  messages: MessagesMap<T>,
): string {
  if (!(name in validators) || !(name in messages)) {
    return '';
  }

  let hint: string = '';
  let inx = -1;
  for (const validator of validators[name]) {
    inx++;

    const missing = [null, undefined, ''].includes(value);
    const isOptional =
      validators[name].filter(
        (v: Validator) => v instanceof Function && v.name === 'optional',
      ).length !== 0;
    if (missing && isOptional) {
      hint = '';
      break;
    }

    if (!validator(value)) {
      if (!(name in messages)) {
        hint = `${name} is not valid`;
        break;
      }
      const fn = (messages[name] as Messages)[inx];
      let msg: string = '';
      let args = {};
      if ('args' in validator) {
        args = { ...validator.args };
      }
      if (Object.keys(args).length === 0) {
        msg = fn(name, value);
      } else {
        msg = fn(name, value, args);
      }
      hint = msg;
      break;
    }
  }
  return hint;
}

const makeDefaults = (
  initialInputs = null,
  ...names: string[]
): Validable<(typeof names)[number]> => {
  const defaults = {} as Validable<(typeof names)[number]>;
  let n: string;
  for (n of names) {
    // use value: null because undefined will make component uncontrolled
    let v: any = null;
    if (!!initialInputs && n in initialInputs) {
      v = initialInputs[n];
    }
    defaults[n] = { value: v, error: false, message: '' };
  }

  return defaults;
};

type ValuableFormControl =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;
type FieldNames<T extends string[]> = T[number];

export type {
  Validable,
  Validation,
  Validator,
  Validators,
  Func,
  FuncWithArgs,
  MessagesMap,
  Messages,
  ValuableFormControl,
  FieldNames,
  InnerValidation,
};

export { validate, makeDefaults };
