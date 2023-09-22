
type Validable<T extends string> = {
  [key in T]: Validation;
};

type Validation = {
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
}
type Messages = Array<(...params:any) => string|string[]>;

 export function validate<T extends string>(name: string, value:any, validators: Validators<T>, messages: MessagesMap<T>): string[] {
  if (!(name in validators) || !(name in messages)) {
    return [];
  }

  const multierrors: string[] = [];
  (
    validators[name]
  ).forEach((validator: Validator, inx: number) => {
    if (!validator(value)) {
      if (!(name in messages)) {
        multierrors.push(`${name} is not valid`);
        return;
      }
      const fn = (
        messages[name] as Messages
      )[inx];
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

export type {Validable, Validation, Validator, Validators, Func, FuncWithArgs, MessagesMap, Messages};
