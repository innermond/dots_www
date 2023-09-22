import {Func, FuncWithArgs} from './form';

function required(v: any): boolean {
  return !!v;
}

function likeemail(v: any): boolean {
  return v.includes('@');
}

function minlen(len: number): FuncWithArgs {
  const fn = (v: any) => {
    const ok = (v?.length ?? 0) >= len;
    return ok;
  };

  fn.args = { len };

  return fn;
}

function maxlen(len: number): Func {
  const fn = (v: any) => {
    const ok = (v?.length ?? 0) <= len;
    return ok;
  };

  fn.args = { len };

  return fn;
}

function checkpass(tips: string[] = ['']): Func {
  const fn = (v: string) => {
    const [strength, tips] = checkPasswordStrength(v);
    fn.args = { tips };
    return strength > 3;
  };
  fn.args = { tips };

  return fn;
}

function checkPasswordStrength(password: string): [number, string[]] {
  // Initialize variables
  let strength: number = 0;
  const tips: string[] = [];

  // Check password length
  if (password.length < 8) {
    tips.push('make the password longer.');
  } else {
    strength += 1;
  }

  // Check for mixed case
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
    strength += 1;
  } else {
    tips.push('use both lowercase and uppercase letters.');
  }

  // Check for numbers
  if (password.match(/\d/)) {
    strength += 1;
  } else {
    tips.push('include at least one number.');
  }

  // Check for special characters
  if (password.match(/[^a-zA-Z\d]/)) {
    strength += 1;
  } else {
    tips.push('include at least one special character.');
  }

  // Return results
  if (strength < 2) {
    tips.unshift('too easy to guess.');
  } else if (strength === 2) {
    tips.unshift('medium difficulty.');
  } else if (strength === 3) {
    tips.unshift('difficult.');
  } else {
    tips.unshift('extremely difficult.');
  }

  return [strength, tips];
}

export {required, minlen, maxlen, likeemail, checkpass};
