import { IPaginationRO, ITableSettings } from '../../interfaces/interfaces';
import { Knex } from 'knex';

export interface IDaoInterface {
  addRowInTable(tableName: string, row);

  configureKnex?(connectionConfig): Promise<Knex> | Knex;

  deleteRowInTable(tableName: string, primaryKey);

  getRowByPrimaryKey(
    tableName: string,
    primaryKey,
    settings: ITableSettings | Record<string, never>,
  );

  getRowsFromTable(
    tableName: string,
    settings: any,
    page: number,
    perPage: number,
    searchedFieldValue: string,
    filteringFields: any,
    autocompleteFields: any,
  );

  getTableForeignKeys(tableName: string);

  getTablePrimaryColumns(tableName: string);

  getTablesFromDB();

  getTableStructure(tableName: string);

  testConnect(): Promise<boolean>;

  updateRowInTable(tableName: string, row, primaryKey);

  validateSettings(settings: ITableSettings | Record<string, never>, tableName);
}

export interface IDaoRowsRO {
  data: Array<string>;
  pagination: IPaginationRO | Record<string, never>;
}
