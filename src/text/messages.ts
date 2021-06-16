import { enumToString } from '../helpers/enum-to-string';
import { QueryOrderingEnum } from '../enums';

export const Messages = {
  CANT_LIST_AND_EXCLUDE: `You cannot select the same field names to view and exclude`,
  CANT_ORDER_AND_EXCLUDE: `You cannot select the same field names to order and exclude`,
  CONNECTION_TOKEN_MISSING: 'Connection token missing',
  DATABASE_MISSING: 'Database is missing',
  FAILED_ESTABLISH_SSH_CONNECTION: `Failed to establish ssh connection`,
  HOST_MISSING: 'Host is missing',
  LIST_PER_PAGE_INCORRECT: `You can't display less than one row per page`,
  MUST_BE_ARRAY: (fieldName: string) =>
    `The field "${fieldName}" must be an array`,
  NO_SUCH_FIELDS_IN_TABLES: (fields: Array<string>, tableName: string) =>
    `There are no such fields: ${fields.join(
      ', ',
    )} - in the table "${tableName}"`,
  ORDERING_FIELD_INCORRECT: `Value of sorting order is incorrect. You can choose from values ${enumToString(
    QueryOrderingEnum,
  )}`,
  PORT_FORMAT_INCORRECT: 'Port value must be a number',
  PORT_MISSING: 'Port value is invalid',
  SSH_FORMAT_INCORRECT: 'Ssh value must be a boolean',
  SSH_HOST_MISSING: 'Ssh host is missing',
  SSH_PORT_MISSING: 'Ssh port is missing',
  SSH_USERNAME_MISSING: 'Ssh username is missing',
  TYPE_MISSING: 'Type is missing',
  USERNAME_MISSING: 'Username is missing',
  UNKNOWN_OPERATION: (operation: string): string =>
    `Received unsupported operation ${operation}.`,
  SOCKET_WAS_DISCONNECTED:
    'Socket is closed. Reconnect will be attempted in 1 second.',
  SOCKET_ENCOUNTERED_ERROR: (message: string): string =>
    `Socket connection error -> ${message ? message : ``}, Closing socket`,
};
