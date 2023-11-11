type Validable<T extends string> = {
  [key in T]: Validation;
};

type Validation = {
  value: any;
  error: boolean;
  message: string[];
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
type Messages = Array<(...params: any) => string | string[]>;

type InnerValidation<T extends string> = {
  validators: Validators<T>;
  messages: MessagesMap<T>;
};

function validate<T extends string>(
  name: string,
  value: any,
  validators: Validators<T>,
  messages: MessagesMap<T>,
): string[] {
  if (!(name in validators) || !(name in messages)) {
    return [];
  }

  const multierrors: string[] = [];
  validators[name].forEach((validator: Validator, inx: number) => {
    if (!validator(value)) {
      if (!(name in messages)) {
        multierrors.push(`${name} is not valid`);
        return;
      }
      const fn = (messages[name] as Messages)[inx];
      let msg: string | string[] = '';
      let args = {};
      if ('args' in validator) {
        args = { ...validator.args };
      }
      if (Object.keys(args).length === 0) {
        msg = fn(name, value);
      } else {
        msg = fn(name, value, args);
      }
      Array.isArray(msg) ? multierrors.push(...msg) : multierrors.push(msg);
    }
  });
  return multierrors;
}

const makeDefaults = (
  ...names: string[]
): Validable<(typeof names)[number]> => {
  const defaults = {} as Validable<(typeof names)[number]>;
  let n: string;
  for (n of names) {
    // use value: null because undefined will make component uncontrolled
    defaults[n] = { value: null, error: false, message: [] };
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
