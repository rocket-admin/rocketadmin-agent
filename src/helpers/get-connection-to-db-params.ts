import * as fs from 'fs';
import * as path from 'path';
import { IConnection } from '../interfaces/interfaces';
import { toPrettyErrorsMsg } from './to-pretty-errors-msg';
import { validateConnectionData } from './validate-connection-data';

export async function getConnectionToDbParams(): Promise<IConnection> {
  const connectionToken = process.env.CONNECTION_TOKEN;
  const port = parseInt(process.env.CONNECTION_PORT);
  const sshPort = parseInt(process.env.CONNECTION_SSH_PORT);
  const sshOption = parseInt(process.env.CONNECTION_SSH) === 1;
  let privateSSHKey = process.env.CONNECTION_PRIVATE_SSH_KEY;
  if (sshOption && (!privateSSHKey || privateSSHKey.length <= 0)) {
    const filePath = path.join('storage', 'ssh-key.txt');
    const privateSSHKeyLines = (<string>await readFile(filePath))
      .trim()
      .split('\n');
    for (let i = 0; i < privateSSHKeyLines.length; i++) {
      privateSSHKeyLines[i] = privateSSHKeyLines[i].trim();
    }
    privateSSHKey = privateSSHKeyLines.join('\n');
  }
  const sslOption = parseInt(process.env.CONNECTION_SSL) === 1;
  let cert = process.env.CONNECTION_SSL_SERTIFICATE;
  if (sslOption && (!cert || cert.length <= 0)) {
    const filePath = path.join('storage', 'ssl-cert.txt');
    const certLines = (<string>await readFile(filePath)).trim().split('\n');
    for (let i = 0; i < certLines.length; i++) {
      certLines[i] = certLines[i].trim();
    }
    cert = certLines.join('\n');
  }

  const connection = {
    type: process.env.CONNECTION_TYPE.toLowerCase(),
    host: process.env.CONNECTION_HOST,
    port: port ? port : null,
    username: process.env.CONNECTION_USERNAME,
    password: process.env.CONNECTION_PASSWORD,
    database: process.env.CONNECTION_DATABASE,
    schema: process.env.CONNECTION_SCHEMA,
    sid: process.env.CONNECTION_SID,
    ssh: sshOption,
    privateSSHKey: privateSSHKey,
    sshHost: process.env.CONNECTION_SSH_HOST,
    sshPort: sshPort ? sshPort : null,
    sshUsername: process.env.CONNECTION_SSH_USERNAME,
    ssl: sslOption,
    cert: cert,
    token: connectionToken,
  };
  const errors = validateConnectionData(connection);
  if (errors.length > 0) {
    console.error(toPrettyErrorsMsg(errors));
    return null;
  }
  return connection;
}

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
