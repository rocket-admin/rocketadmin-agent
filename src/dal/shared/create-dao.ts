import { IDaoInterface } from './dao-interface';
import { DaoPostgres } from '../dao/dao-postgres';
import { DaoMysql } from '../dao/dao-mysql';
import { DaoOracledb } from '../dao/dao-oracledb';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { DaoSshMysql } from '../dao-ssh/dao-ssh-mysql';
import { DaoMssql } from '../dao/dao-mssql';
import { DaoSshPostgres } from '../dao-ssh/dao-ssh-postgres';
import { DaoSshOracleDB } from '../dao-ssh/dao-ssh-oracledb';
import { DaoSshMssql } from '../dao-ssh/dao-ssh-mssql';
import { IConnection } from '../../interfaces/interfaces';

export function createDao(connection: IConnection): IDaoInterface {
  switch (connection.type) {
    case 'postgres':
      if (connection.ssh) {
        return new DaoSshPostgres(connection);
      } else {
        return new DaoPostgres(connection);
      }
    case 'mysql':
      if (connection.ssh) {
        return new DaoSshMysql(connection);
      } else {
        return new DaoMysql(connection);
      }
    case 'oracledb':
      if (connection.ssh) {
        return new DaoSshOracleDB(connection);
      } else {
        return new DaoOracledb(connection);
      }
    case 'mssql':
      if (connection.ssh) {
        return new DaoSshMssql(connection);
      } else {
        return new DaoMssql(connection);
      }
    default:
      throw new HttpException(
        {
          message:
            'Connection to this type of database has not been implemented yet',
        },
        HttpStatus.BAD_REQUEST,
      );
  }
}
