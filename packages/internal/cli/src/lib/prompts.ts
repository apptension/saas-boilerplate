/**
 * Prompts wrapper that uses dynamic imports for ESM-only @inquirer/prompts
 * This allows us to use the modern inquirer in a CommonJS environment
 */

export interface SelectChoice<T> {
  value: T;
  name: string;
  description?: string;
}

export interface SelectOptions<T> {
  message: string;
  choices: SelectChoice<T>[];
  default?: T;
}

export interface ConfirmOptions {
  message: string;
  default?: boolean;
}

export interface InputOptions {
  message: string;
  default?: string;
  validate?: (value: string) => boolean | string;
}

export interface PasswordOptions {
  message: string;
  mask?: string;
  validate?: (value: string) => boolean | string;
}

export interface CheckboxChoice {
  value: string;
  name: string;
  checked?: boolean;
}

export interface CheckboxOptions {
  message: string;
  choices: CheckboxChoice[];
}

// Dynamic import wrapper for @inquirer/prompts
let inquirerPrompts: typeof import('@inquirer/prompts') | null = null;

async function getInquirer(): Promise<typeof import('@inquirer/prompts')> {
  if (!inquirerPrompts) {
    inquirerPrompts = await import('@inquirer/prompts');
  }
  return inquirerPrompts;
}

export async function select<T>(options: SelectOptions<T>): Promise<T> {
  const { select: inquirerSelect } = await getInquirer();
  return inquirerSelect<T>(options);
}

export async function confirm(options: ConfirmOptions): Promise<boolean> {
  const { confirm: inquirerConfirm } = await getInquirer();
  return inquirerConfirm(options);
}

export async function input(options: InputOptions): Promise<string> {
  const { input: inquirerInput } = await getInquirer();
  return inquirerInput(options);
}

export async function password(options: PasswordOptions): Promise<string> {
  const { password: inquirerPassword } = await getInquirer();
  return inquirerPassword(options);
}

export async function checkbox(options: CheckboxOptions): Promise<string[]> {
  const { checkbox: inquirerCheckbox } = await getInquirer();
  return inquirerCheckbox(options);
}
