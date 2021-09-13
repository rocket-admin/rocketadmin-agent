import * as fs from 'fs';
import * as path from 'path';
import { IConnection } from '../interfaces/interfaces';
import { toPrettyErrorsMsg } from './to-pretty-errors-msg';
import { validateConnectionData } from './validate-connection-data';

export async function getConnectionToDbParams(): Promise<IConnection> {
  const connectionToken = process.env.CONNECTION_TOKEN;
  const port = parseInt(process.env.CONNECTION_PORT);
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
