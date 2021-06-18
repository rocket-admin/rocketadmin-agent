import { validateConnectionData } from './validate-connection-data';
import { toPrettyErrorsMsg } from './to-pretty-errors-msg';
import { IConnection } from '../interfaces/interfaces';

export function getConnectionToDbParams(token: string): IConnection {
  const connectionToken = process.env.CONNECTION_TOKEN;
  if (connectionToken !== token) {
    return null;
  }
  const port = parseInt(process.env.CONNECTION_PORT);
  const sshPort = parseInt(process.env.CONNECTION_SSH_PORT);
  const connection = {
    type: process.env.CONNECTION_TYPE.toLowerCase(),
    host: process.env.CONNECTION_HOST,
    port: port ? port : null,
    username: process.env.CONNECTION_USERNAME,
    password: process.env.CONNECTION_PASSWORD,
    database: process.env.CONNECTION_DATABASE,
    schema: process.env.CONNECTION_SCHEMA,
    sid: process.env.CONNECTION_SID,
    ssh: parseInt(process.env.CONNECTION_SSH) === 1,
    privateSSHKey: process.env.CONNECTION_PRIVATE_SSH_KEY,
    sshHost: process.env.CONNECTION_SSH_HOST,
    sshPort: sshPort ? sshPort : null,
    sshUsername: process.env.CONNECTION_SSH_USERNAME,
    ssl: parseInt(process.env.CONNECTION_SSL) === 1,
    cert: process.env.CONNECTION_SSL_SERTIFICATE,
    token: connectionToken,
  };
  const errors = validateConnectionData(connection);
  if (errors.length > 0) {
    console.error(toPrettyErrorsMsg(errors));
    return null;
  }
  return connection;
}
