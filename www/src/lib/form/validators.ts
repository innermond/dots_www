import { Validator } from './form';

function optional(): boolean {
  return true;
}

function required(): Validator {
  const fn = (v: any) => !!v;
  fn.tpl = 'is required';
  return fn;
}

function likeemail(): Validator {
  const fn = (v: any) => v.includes('@');
  fn.tpl = 'is not an email';
  return fn;
}

const int: Validator = (v: any): boolean => {
  int.tpl = `${v} is not an integer`;
  return !isNaN(parseInt(v));
};

function minlen(len: number): Validator {
  const fn = (v: any) => {
    const ok = (v?.length ?? 0) >= len;
    return ok;
  };

  fn.args = { len };
  fn.tpl = `must be at least ${len}`;

  return fn;
}

function maxlen(len: number): Validator {
  const fn = (v: any) => {
    const ok = (v?.length ?? 0) < len;
    return ok;
  };

  fn.args = { len };
  fn.tpl = `must be less than ${len}`;

  return fn;
}

function checkpass(tips: string = ''): Validator {
  const fn = (v: string) => {
    const [strength, tips] = checkPasswordStrength(v);
    fn.args = { tips };
    return strength > 3;
  };
  fn.args = { tips };

  return fn;
}

function checkPasswordStrength(password: string): [number, string] {
  // Initialize variables
  let strength: number = 0;
  const tips: string[] = [];

  // Check password length
  if (password.length < 8) {
    tips.push('make the password longer');
  } else {
    strength += 1;
  }

  // Check for mixed case
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
    strength += 1;
  } else {
    tips.push('use both lowercase and uppercase letters');
  }

  // Check for numbers
  if (password.match(/\d/)) {
    strength += 1;
  } else {
    tips.push('include at least one number');
  }

  // Check for special characters
  if (password.match(/[^a-zA-Z\d]/)) {
    strength += 1;
  } else {
    tips.push('include at least one special character');
  }

  // Return results
  if (strength < 2) {
    tips.unshift('too easy to guess');
  } else if (strength === 2) {
    tips.unshift('medium difficulty');
  } else if (strength === 3) {
    tips.unshift('difficult');
  } else {
    tips.unshift('extremely difficult');
  }

  return [strength, tips.join(', ')];
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

const isSimilar = (origin: { [key: string]: any }, compared: any): boolean => {
  const originKeys = Object.keys(origin);
  const comparedKeys = Object.keys(compared);

  if (originKeys.length > comparedKeys.length) {
    return false;
  }

  for (const key of originKeys) {
    if (typeof origin[key] === 'object' && typeof compared[key] === 'object') {
      if (!isSimilar(origin[key], compared[key])) {
        return false;
      }
    } else {
      if (origin[key] !== compared[key]) {
        return false;
      }
    }
  }

  // all key-value pairs are the same
  return true;
};

export {
  optional,
  required,
  int,
  minlen,
  maxlen,
  likeemail,
  checkpass,
  isEmptyObject,
  isSimilar,
};
