import loadable, { DefaultComponent } from '@loadable/component';
import { isNil } from 'ramda';

type DefaultExportModule = DefaultComponent<unknown>;
type NamedExportModule = Record<string, DefaultComponent<unknown>>;

type NamedExportLoader = () => Promise<NamedExportModule>;
type DefaultExportLoader = () => Promise<DefaultExportModule>;
type Module = NamedExportModule | DefaultExportModule;


export const asyncComponent = (asyncLoader: NamedExportLoader | DefaultExportLoader, exportedAs?: string) => {
  const isNamedExportModule = (module: Module, exportedAs?: string): module is NamedExportModule => {
    return !isNil(exportedAs);
  };

  return loadable(async () => {
    const module = await asyncLoader();
    return isNamedExportModule(module, exportedAs) && exportedAs ? module[exportedAs] : module as DefaultExportModule;
  });
};
