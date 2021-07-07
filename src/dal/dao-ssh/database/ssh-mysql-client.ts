import { Constants } from '../../../helpers/constants/constants';
import { Client } from 'ssh2';
import * as mysql from 'mysql2';
import { Cacher } from '../../../helpers/cache/cacher';
import { IConnection } from '../../../interfaces/interfaces';

export function getSshMySqlClient(
  connectionConfig: IConnection,
  freeForwardInPort: number,
): Promise<Client> {
  const {
    host,
    username,
    password,
    database,
    port,
    privateSSHKey,
    sshHost,
    sshPort,
    sshUsername,
  } = connectionConfig;
  const ssh = new Client();
  return new Promise(function (resolve, reject) {
    ssh
      .on('ready', function () {
        ssh.forwardOut(
          // source address, this can usually be any valid address
          Constants.DEFAULT_FORWARD_IN_HOST,
          // source port, this can be any valid port number
          freeForwardInPort,
          // destination address (localhost here refers to the SSH server)
          host,
          // destination port
          port,
          function (err, stream) {
            if (err) reject(err); // SSH error: can also send error in promise ex. reject(err)

            // use `sql` connection as usual
            const connection = mysql.createConnection({
              host: Constants.DEFAULT_FORWARD_IN_HOST,
              user: username,
              port: freeForwardInPort,
              password: password,
              database: database,
              stream: stream,
            });

            // send connection back in variable depending on success or not
            connection.connect(function (err) {
              if (!err) {
                resolve(connection);
              } else {
                console.log('ERROR + error message => ' + JSON.stringify(err));
                reject(err);
              }
            });
          },
        );
      })
      .connect({
        host: sshHost,
        port: sshPort,
        username: sshUsername,
        privateKey: privateSSHKey,
        keepaliveInterval: Constants.KEEP_ALIVE_INTERVAL,
        keepaliveCountMax: 120,
      });

    ssh.on('close', function () {
      Cacher.delDriverCache(connectionConfig);
    });

    ssh.on('error', function (e) {
      reject(e);
    });
  }).catch((e) => {
    throw new Error(e);
  });
}
