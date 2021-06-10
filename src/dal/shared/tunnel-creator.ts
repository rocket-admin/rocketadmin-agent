import { isObjectEmpty } from '../../helpers';
import * as getPort from 'get-port';
import { Constants } from '../../helpers/constants/constants';
import tunnel = require('tunnel-ssh');
import { ConnectionTypeEnum } from '../../enums';
import { DaoPostgres } from '../dao/dao-postgres';
import { DaoOracledb } from '../dao/dao-oracledb';
import { DaoMssql } from '../dao/dao-mssql';
import { Cacher } from '../../helpers/cache/cacher';
import { IConnection } from '../../interfaces/interfaces';

export class TunnelCreator {
  static async createTunneledKnex(connection: IConnection): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const cachedTnl = Cacher.getTunnelCache(connection);
      if (
        cachedTnl &&
        !isObjectEmpty(cachedTnl) &&
        cachedTnl.knex &&
        cachedTnl.tnl
      ) {
        resolve(cachedTnl.knex);
        return;
      }
      const freePort = await getPort();
      const sshConfig = TunnelCreator.getSshTunelConfig(connection, freePort);
      const tnl = await tunnel(sshConfig, async (err: any, server: any) => {
        if (err) {
          throw err;
        }
        connection.host = Constants.DEFAULT_FORWARD_IN_HOST;
        connection.port = freePort;

        const knex = this.configureKnex(connection);
        const tnlCachedObj = {
          tnl: tnl,
          knex: knex,
        };
        tnl.on('error', (e) => {
          Cacher.delTunnelCache(connection, tnlCachedObj);
          reject(e);
          return;
        });
        Cacher.setTunnelCache(connection, tnlCachedObj);
        resolve(tnlCachedObj.knex);
        return;
      });
    }).catch((e) => {
      throw new Error(e);
    });
  }

  private static getSshTunelConfig(connection, freePort: number) {
    const { host, port, privateSSHKey, sshPort, sshHost, sshUsername } =
      connection;

    return {
      host: sshHost,
      port: sshPort,
      username: sshUsername,
      privateKey: privateSSHKey,
      keepAlive: true,
      dstHost: host,
      dstPort: port,
      localHost: 'localhost',
      localPort: freePort,
    };
  }

  private static configureKnex(connectionConfig) {
    switch (connectionConfig.type) {
      case ConnectionTypeEnum.postgres:
        return DaoPostgres.configureKnex(connectionConfig);

      case ConnectionTypeEnum.oracledb:
        return DaoOracledb.configureKnex(connectionConfig);

      case ConnectionTypeEnum.mssql:
        return DaoMssql.configureKnex(connectionConfig);
      default:
        break;
    }
  }
}
