import { IDaoInterface } from './dao-interface';
import { DaoPostgres } from '../dao/dao-postgres';
import { DaoMysql } from '../dao/dao-mysql';
import { DaoOracledb } from '../dao/dao-oracledb';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { DaoMssql } from '../dao/dao-mssql';
import { IConnection } from '../../interfaces/interfaces';

export function createDao(connection: IConnection): IDaoInterface {
  switch (connection.type) {
    case 'postgres':
      return new DaoPostgres(connection);
    case 'mysql':
      return new DaoMysql(connection);
    case 'oracledb':
      return new DaoOracledb(connection);
    case 'mssql':
      return new DaoMssql(connection);
    default:
      throw new HttpException(
        {
          message: 'Connection to this type of database has not been implemented yet',
        },
        HttpStatus.BAD_REQUEST,
      );
  }
}
