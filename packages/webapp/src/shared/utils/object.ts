import Str from '@supercharge/strings';

/**
 * Translate all top-level keys of the given `object` to camelCase.
 */
export const camelCaseKeys = (object: Record<string, any>): Record<string, any> => {
  return Object.entries(object).reduce((carry: Record<string, any>, [key, value]) => {
    carry[Str(key).camel().get()] = value;

    return carry;
  }, {});
};
