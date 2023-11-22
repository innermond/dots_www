type Validation<T> = {
  value: T;
  error: boolean;
  message: string;
};

type NonEmpty<V> = {
  [key in keyof V]: V[key];
};

type Validable<V> = {
  [key in keyof V]: Validation<V[key]>;
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

const isEmptyObject = (value: unknown): value is Record<string, any> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.keys(value).length === 0
  );
};

type ExcludeEmptyObject<T> = T extends {} ? never : T;
// this function never returns {}
// it will returns either a muscular object or it will throw
const makeDefaults = (
  initialInputs = {},
  ...names: string[]
): ExcludeEmptyObject<Validable<typeof initialInputs>> => {
  if (!names?.length) {
    throw new Error('names for default values are not specified');
  }

  const defaults = {} as any;
  let n: string;
  for (n of names) {
    // use value: null because undefined will make component uncontrolled
    let v: (typeof initialInputs)[keyof typeof initialInputs] | null = null;
    const override = initialInputs !== null && n in initialInputs;
    if (override) {
      v = initialInputs[n as keyof typeof initialInputs];
    }
    defaults[n] = { value: v, error: false, message: '' } as Validation<
      (typeof initialInputs)[keyof typeof initialInputs] | null
    >;
  }

  if (isEmptyObject(defaults)) {
    throw new Error('cannot figure out defaults values');
  }

  return defaults as ReturnType<typeof makeDefaults>;
};

type ValuableFormControl =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;
type FieldNames<T extends string[]> = T[number];

export type {
  Validable,
  NonEmpty,
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
