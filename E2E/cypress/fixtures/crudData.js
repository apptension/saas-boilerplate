import {
  CRUD_NAME_REQUIRED_ERROR_TEXT,
  CRUD_NAME_TOO_LONG_ERROR_TEXT,
  EMPTY,
  TOO_LONG,
} from '../support/assertion';

export default [
  {
    crudName: '',
    nameState: EMPTY,
    errorText: [CRUD_NAME_REQUIRED_ERROR_TEXT],
  },
  {
    crudName: 'a'.repeat(256),
    nameState: TOO_LONG,
    errorText: [CRUD_NAME_TOO_LONG_ERROR_TEXT],
  },
];
