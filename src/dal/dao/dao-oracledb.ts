import { Cacher } from '../../helpers/cache/cacher';
import { Constants } from '../../helpers/constants/constants';
import { FilterCriteriaEnum, QueryOrderingEnum } from '../../enums';
import { IConnection, ITableSettings } from '../../interfaces/interfaces';
import { IDaoInterface } from '../shared/dao-interface';
import { knex } from 'knex';
import {
  checkFieldAutoincrement,
  isObjectEmpty,
  listTables,
  objectKeysToLowercase,
  renameObjectKeyName,
  tableSettingsFieldValidator,
} from '../../helpers';

export class DaoOracledb implements IDaoInterface {
  private readonly connection: IConnection;

  constructor(connection: IConnection) {
    this.connection = connection;
  }

  async addRowInTable(tableName: string, row: any): Promise<any> {
    const tableStructure = (await this.getTableStructure(
      tableName,
    )) as Array<any>;
    const primaryColumns = (await this.getTablePrimaryColumns(
      tableName,
    )) as Array<any>;
    const primaryKey = primaryColumns[0];
    const primaryKeyIndexInStructure = tableStructure
      .map((e) => {
        return e.column_name;
      })
      .indexOf(primaryKey.column_name);
    const primaryKeyStructure = tableStructure[primaryKeyIndexInStructure];
    const knex = await this.configureKnex(this.connection);
    const keys = Object.keys(row);
    const values = Object.values(row).map((val) => {
      return `${val}`;
    });
    let result;
    tableName = this.attachSchemaNameToTableName(tableName);
    if (primaryColumns?.length > 0) {
      if (checkFieldAutoincrement(primaryKeyStructure.column_default)) {
        await knex
          .transaction((trx) => {
            knex
              .raw(
                `insert INTO ${tableName} (${keys
                  .map((_) => '??')
                  .join(', ')}) VALUES
                     (${values.map((_) => '?').join(', ')})`,
                [...keys, ...values],
              )
              .transacting(trx)
              .then(trx.commit)
              .catch(trx.rollback);
          })
          .catch((e) => {
            throw new Error(e);
          });
        const queryResult = await knex(tableName)
          .select(
            knex.raw(
              `${primaryKeyStructure.column_default.replace(
                /nextval/gi,
                'currval',
              )}`,
            ),
          )
          .catch((e) => {
            throw new Error(e);
          });
        result = {
          [primaryKey.column_name]: queryResult[0]['CURRVAL'].toString(),
        };
      } else {
        await knex
          .transaction((trx) => {
            knex
              .raw(
                `insert INTO ${tableName} (${keys
                  .map((_) => '??')
                  .join(', ')}) VALUES
                     (${values.map((_) => '?').join(', ')})`,
                [...keys, ...values],
              )
              .transacting(trx)
              .then(trx.commit)
              .catch(trx.rollback);
          })
          .catch((e) => {
            throw new Error(e);
          });
        result = {
          [primaryKey.column_name]: row[primaryKey.column_name],
        };
      }
    } else {
      result = await knex
        .transaction((trx) => {
          knex
            .raw(
              `insert INTO ${tableName} (${keys
                .map((_) => '??')
                .join(', ')}) VALUES
                     (${values.map((_) => '?').join(', ')})`,
              [...keys, ...values],
            )
            .transacting(trx)
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .catch((e) => {
          throw new Error(e);
        });
    }
    return result;
  }

  async deleteRowInTable(tableName: string, primaryKey: any): Promise<any> {
    return this.configureKnex(this.connection)(tableName)
      .withSchema(
        this.connection.schema
          ? this.connection.schema
          : this.connection.username.toUpperCase(),
      )
      .where(primaryKey)
      .del();
  }

  async getRowByPrimaryKey(tableName: string, primaryKey): Promise<any> {
    return this.configureKnex(this.connection)(tableName)
      .withSchema(
        this.connection.schema
          ? this.connection.schema
          : this.connection.username.toUpperCase(),
      )
      .where(primaryKey);
  }

  async getRowsFromTable(
    tableName: string,
    settings: ITableSettings,
    page: number,
    perPage: number,
    searchedFieldValue: string,
    filteringFields: any,
    autocompleteFields: any,
  ): Promise<any> {
    const knex = await this.configureKnex(this.connection);

    if (
      autocompleteFields &&
      !isObjectEmpty(autocompleteFields) &&
      autocompleteFields.value &&
      autocompleteFields.fields.length > 0
    ) {
      const rows = await knex
        .select(autocompleteFields.fields)
        .from(tableName)
        .withSchema(
          this.connection.schema
            ? this.connection.schema
            : this.connection.username.toUpperCase(),
        )
        .modify((builder) => {
          /*eslint-disable*/
          const { fields, value } = autocompleteFields;
          if (value !== '*') {
            for (const field of fields) {
              builder.orWhere(field, 'like', `${value}%`);
            }
          } else {
            return;
          }
          /*eslint-enable*/
        })
        .limit(Constants.AUTOCOMPLETE_ROW_LIMIT);
      return {
        data: rows,
        pagination: {},
      };
    }

    /* eslint-disable */
    if (!page || page <= 0) {
      page = Constants.DEFAULT_PAGINATION.page;
      const { list_per_page } = settings;
      if ((list_per_page && list_per_page > 0) && (!perPage || perPage <= 0)) {
        perPage = list_per_page;
      } else {
        perPage = Constants.DEFAULT_PAGINATION.perPage;
      }
    }
    const availableFields = await this.findAvaliableFields(settings, tableName);
//********** with pagination ************
    let orderingField = undefined;
    let order = undefined;
    let searchedFields = undefined;
    if (settings.search_fields && settings.search_fields.length > 0) {
      searchedFields = settings.search_fields;
    }
    if (settings && settings.ordering_field) {
      orderingField = settings.ordering_field;
    } else {
      orderingField = availableFields[0];
    }
    if (settings.ordering) {
      order = settings.ordering;
    } else {
      order = QueryOrderingEnum.ASC;
    }
    tableName = this.attachSchemaNameToTableName(tableName);
    return await getAvailableFieldsWithPagination(
      tableName,
      page,
      perPage,
      availableFields,
      orderingField,
      order,
      searchedFields,
      searchedFieldValue,
      filteringFields,
    );

    async function getAvailableFieldsWithPagination
    (tableName: string,
     page: number,
     perPage: number,
     availableFields: Array<string>,
     orderingField: string,
     order = QueryOrderingEnum.ASC,
     searchedFields: Array<string>,
     searchedFieldValue: any,
     filteringFields: any) {
      let andWhere = '';
      const searchedFieldsKeyValArr = [];
      if (searchedFields && searchedFields.length > 0 && searchedFieldValue) {
        for (let i = 0; i < searchedFields.length; i++) {
          if (i === 0) {
            andWhere += ` WHERE CAST (?? AS VARCHAR (255))=?`;
          } else {
            andWhere += ` OR CAST (?? AS VARCHAR (255))=?`;
          }
          searchedFieldsKeyValArr.push(searchedFields[i], searchedFieldValue);
        }
      }
      const filteringFieldsKeysValues = [];
      for (const filteringField of filteringFields) {
        const { field, value } = filteringField;
        filteringFieldsKeysValues.push(field, value);
      }
      const filterWhere = DaoOracledb.buildFilterWhere(filteringFields, andWhere);
      const result = await knex.transaction(trx => {
        knex.raw(`WITH RECORDSET AS (
          SELECT ${availableFields.map(_ => '??').join(', ')}
          FROM ${tableName} ${andWhere ? andWhere : ''} ${filterWhere ? filterWhere : ''}
          ),
          NUMBERED AS (SELECT ROW_NUMBER() OVER (ORDER BY ?? ${order} ) RN, RECORDSET.* FROM RECORDSET)
          SELECT ${page} PAGE_NUMBER, CEIL((SELECT COUNT(*) FROM NUMBERED) / ${perPage}) TOTAL_PAGES,
          ${perPage} PAGE_SIZE,
          (SELECT COUNT(*) FROM NUMBERED) TOTAL_ROWS, NUMBERED.* FROM NUMBERED
          WHERE RN BETWEEN ((${perPage}*${page})-${perPage}+1) AND (${perPage}*${page})
          `, [...availableFields, ...searchedFieldsKeyValArr, ...filteringFieldsKeysValues, orderingField],
        ).transacting(trx).then(trx.commit).catch(trx.rollback);
      });
      if (!result[0]) {
        return {
          data: [],
          pagination: {},
        };
      } else {
        const { PAGE_NUMBER, TOTAL_PAGES, PAGE_SIZE, TOTAL_ROWS } = result[0];
        const pureRows = result.map((el) => {
          delete el.PAGE_NUMBER;
          delete el.TOTAL_PAGES;
          delete el.PAGE_SIZE;
          delete el.TOTAL_ROWS;
          delete el.RN;
          return el;
        });
        return {
          data: pureRows,
          pagination: {
            total: TOTAL_ROWS,
            lastPage: TOTAL_PAGES,
            perPage: PAGE_SIZE,
            currentPage: PAGE_NUMBER,
          },
        };
      }
    }
  }

  async getTablesFromDB() {
    const schema = this.connection.schema ? this.connection.schema : (this.connection.username).toUpperCase();
    return await listTables(this.configureKnex(this.connection), schema);
  }

//***********************************************************************************
  async getTablePrimaryColumns(tableName: string) {
    const knex = await this.configureKnex(this.connection);
    const schema = this.connection.schema ? this.connection.schema : (this.connection.username).toUpperCase();
    const primaryColumns = await knex(tableName)
      .select(knex.raw('cols.column_name'))
      .from(knex.raw('all_constraints cons, all_cons_columns cols'))
      .where(knex.raw(`cols.table_name = ?
      AND cols.owner = ?
      AND cons.constraint_type = 'P'
      AND cons.constraint_name = cols.constraint_name
      AND cons.owner = cols.owner   
      `, [tableName, schema]));
    const primaryColumnsInLowercase = [];
    for (const primaryColumn of primaryColumns) {
      primaryColumnsInLowercase.push(objectKeysToLowercase(primaryColumn));
    }
    return primaryColumnsInLowercase;
  }

  async getTableStructure(tableName: string) {
    const schema = this.connection.schema ? this.connection.schema : (this.connection.username).toUpperCase();
    const structureColumns = await this.configureKnex(this.connection).select(
      'COLUMN_NAME',
      'DATA_DEFAULT',
      'DATA_TYPE',
      'NULLABLE',
      'DATA_LENGTH')
      .from('ALL_TAB_COLUMNS')
      .where(`TABLE_NAME`, `${tableName}`)
      .andWhere(`OWNER`, `${schema}`);

    const structureColumnsInLowercase = [];
    for (const structureColumn of structureColumns) {
      renameObjectKeyName(structureColumn, 'DATA_DEFAULT', 'column_default');
      structureColumn.NULLABLE = (structureColumn.NULLABLE === 'Y');
      renameObjectKeyName(structureColumn, 'NULLABLE', 'allow_null');
      renameObjectKeyName(structureColumn, 'DATA_LENGTH', 'character_maximum_length');
      structureColumnsInLowercase.push(objectKeysToLowercase(structureColumn));
    }
    return structureColumnsInLowercase;

  }

//***********************************************************************************
  // configuration for Oracle differs from configuration for other databases
  configureKnex(connectionConfig: IConnection) {
    return DaoOracledb.configureKnex(connectionConfig);
  }

  public static configureKnex(connectionConfig: IConnection) {
    const { host, username, password, database, port, type, sid, ssl, cert } = connectionConfig;
    const cachedKnex = Cacher.getCachedKnex(connectionConfig);
    if (cachedKnex) {
      return cachedKnex;
    } else {
      const newKnex = knex({
        client: type,
        connection: {
          user: username,
          database: database,
          password: password,
          connectString: `${host}:${port}/${sid ? sid : ''}`,
          ssl: ssl ? { ca: cert } : { rejectUnauthorized: false },
        },
      });
      Cacher.setKnexCache(connectionConfig, newKnex);
      return newKnex;
    }
  }

  async updateRowInTable(tableName: string, row, primaryKey) {
    const primaryKeyKeys = Object.keys(primaryKey);
    Object.values(primaryKey);
    const knex = await this.configureKnex(this.connection);
    const keys = Object.keys(row);
    let setString = `SET `;
    for (const key of keys) {
      setString += `"${key}" = '${row[key]}', `;
    }
    setString = setString.replace(/,\s*$/, '');

    let whereString = `WHERE `;
    for (let i = 0; i < primaryKeyKeys.length; i++) {
      if (primaryKeyKeys[i + 1]) {
        whereString += `"${primaryKeyKeys[i]}" = ${primaryKey[primaryKeyKeys[i]]} AND `;
      } else {
        whereString += `"${primaryKeyKeys[i]}" = ${primaryKey[primaryKeyKeys[i]]}`;
      }
    }
    tableName = this.attachSchemaNameToTableName(tableName);
    return await knex.transaction(trx => {
      knex.raw(`UPDATE ${tableName} ${setString} ${whereString}`)
        .transacting(trx)
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }

  async getTableForeignKeys(tableName: string) {
    const knex = await this.configureKnex(this.connection);
    const schema = this.connection.schema ? this.connection.schema : (this.connection.username).toUpperCase();
    const foreignKeys = await knex
      .raw(`SELECT a.constraint_name, a.table_name, a.column_name,  c.owner,
       c_pk.table_name r_table_name,  b.column_name r_column_name
       FROM user_cons_columns a
       JOIN user_constraints c ON a.owner = c.owner
       AND a.constraint_name = c.constraint_name
       JOIN user_constraints c_pk ON c.r_owner = c_pk.owner
       AND c.r_constraint_name = c_pk.constraint_name
       JOIN user_cons_columns b ON C_PK.owner = b.owner
       AND  C_PK.CONSTRAINT_NAME = b.constraint_name AND b.POSITION = a.POSITION
       WHERE c.constraint_type = 'R' AND a.table_name = ? AND a.OWNER = ?`, [tableName, schema]);

    const transformedForeignKeys = [];
    for (const foreignKey of foreignKeys) {
      transformedForeignKeys.push({
        /* eslint-disable */
        referenced_column_name: foreignKey.R_COLUMN_NAME,
        referenced_table_name: foreignKey.R_TABLE_NAME,
        constraint_name: foreignKey.CONSTRAINT_NAME,
        column_name: foreignKey.COLUMN_NAME,
        /* eslint-enable */
      });
    }
    return transformedForeignKeys;
  }

  async validateSettings(settings: ITableSettings): Promise<Array<string>> {
    const tableStructure = await this.getTableStructure(settings.table_name);
    return tableSettingsFieldValidator(tableStructure, settings);
  }

  private async findAvaliableFields(
    settings: ITableSettings,
    tableName: string,
  ): Promise<Array<string>> {
    let availableFields = [];
    if (isObjectEmpty(settings)) {
      const tableStructure = await this.getTableStructure(tableName);
      availableFields = tableStructure.map((el) => {
        return el.column_name;
      });
      return availableFields;
    }
    const excludedFields = settings.excluded_fields;
    if (settings.list_fields && settings.list_fields.length > 0) {
      availableFields = settings.list_fields;
    } else {
      const tableStructure = await this.getTableStructure(tableName);
      availableFields = tableStructure.map((el) => {
        return el.column_name;
      });
    }
    if (excludedFields && excludedFields.length > 0) {
      for (const field of excludedFields) {
        const delIndex = availableFields.indexOf(field);
        if (delIndex >= 0) {
          availableFields.splice(availableFields.indexOf(field), 1);
        }
      }
    }
    return availableFields;
  }

  static buildFilterWhere(filteredFields, where): string {
    if (!filteredFields || filteredFields.length <= 0) {
      return undefined;
    }
    let filterWhere = '';
    // where? filterWhere
    for (let i = 0; i < filteredFields.length; i++) {
      const { criteria } = filteredFields[i];
      switch (criteria) {
        case FilterCriteriaEnum.eq:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? = ?`;
          } else {
            filterWhere += ` AND ?? = ?`;
          }
          break;
        case FilterCriteriaEnum.startswith:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? LIKE '?%'`;
          } else {
            filterWhere += ` AND ?? LIKE '?%'`;
          }
          break;
        case FilterCriteriaEnum.endswith:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '}  ?? LIKE '%?'`;
          } else {
            filterWhere += ` AND ?? LIKE '%?'`;
          }
          break;
        case FilterCriteriaEnum.gt:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? > ?`;
          } else {
            filterWhere += ` AND ?? > ?`;
          }
          break;
        case FilterCriteriaEnum.lt:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? < ?`;
          } else {
            filterWhere += ` AND ?? < ?`;
          }
          break;
        case FilterCriteriaEnum.lte:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? <= ?`;
          } else {
            filterWhere += ` AND ?? <= ?`;
          }
          break;
        case FilterCriteriaEnum.gte:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? >= ?`;
          } else {
            filterWhere += ` AND ?? >= ?`;
          }
          break;
        case FilterCriteriaEnum.contains:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? LIKE '%?%'`;
          } else {
            filterWhere += ` AND ?? LIKE '%?%'`;
          }
          break;
        case FilterCriteriaEnum.icontains:
          if (i === 0) {
            filterWhere += ` ${where ? ' AND ' : ' WHERE '} ?? NOT LIKE '%?%'`;
          } else {
            filterWhere += ` AND ?? NOT LIKE '%?%'`;
          }
          break;
      }
    }
    return filterWhere;
  }

  async testConnect(): Promise<boolean> {
    const knex = this.configureKnex(this.connection);
    let result;
    try {
      result = await knex('DUAL').select(1);
    } catch (e) {
      return false;
    }
    return !!result;
  }

  private attachSchemaNameToTableName(tableName: string): string {
    tableName = this.connection.schema
      ? `"${this.connection.schema}"."${tableName}"`
      : `"${this.connection.username.toUpperCase()}"."${tableName}"`;
    return tableName;
  }
}
