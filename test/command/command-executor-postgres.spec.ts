import * as faker from 'faker';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Knex, knex } from 'knex';
import { Test } from '@nestjs/testing';
import { IConnection } from '../../src/interfaces/interfaces';
import { CommandExecutor } from '../../src/command/command-executor';
import { OperationTypeEnum } from '../../src/enums/operation-type.enum';
import { Constants } from '../../src/helpers/constants/constants';

describe('Command executor tests', () => {
  let app: INestApplication;
  const testTableName = 'users';
  const testTableColumnName = 'name';
  const testTAbleSecondColumnName = 'email';
  const testSearchedUserName = 'Vasia';
  const testEntitiesSeedsCount = 42;
  const connectionConfig: IConnection = {
    cert: '',
    database: 'template1',
    host: 'localhost',
    password: '123',
    port: 9002,
    privateSSHKey: '',
    schema: '',
    sid: '',
    ssh: false,
    sshHost: '',
    sshPort: 0,
    sshUsername: '',
    ssl: false,
    type: 'postgres',
    username: 'postgres',
  };

  async function resetPostgresTestDB() {
    const Knex = knex({
      client: connectionConfig.type,
      connection: {
        host: connectionConfig.host,
        user: connectionConfig.username,
        password: connectionConfig.password,
        database: connectionConfig.database,
        port: 9002,
      },
    });
    await Knex.schema.dropTableIfExists(testTableName);
    await Knex.schema.createTableIfNotExists(testTableName, function (table) {
      table.increments();
      table.string(testTableColumnName);
      table.string(testTAbleSecondColumnName);
      table.timestamps();
    });

    for (let i = 0; i < testEntitiesSeedsCount; i++) {
      if (
        i === 0 ||
        i === testEntitiesSeedsCount - 21 ||
        i === testEntitiesSeedsCount - 5
      ) {
        await Knex(testTableName).insert({
          [testTableColumnName]: testSearchedUserName,
          [testTAbleSecondColumnName]: faker.internet.email(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        await Knex(testTableName).insert({
          [testTableColumnName]: faker.name.findName(),
          [testTAbleSecondColumnName]: faker.internet.email(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    await Knex.destroy();
  }

  beforeEach(async () => {
    jest.setTimeout(10000);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await resetPostgresTestDB();
  });

  describe('execute command', () => {
    it('should return added row primary key when call add row in table', async () => {
      const commandExecutor = new CommandExecutor(connectionConfig);

      const fakeName = faker.name.findName();
      const fakeMail = faker.internet.email();

      const row = {
        [testTableColumnName]: fakeName,
        [testTAbleSecondColumnName]: fakeMail,
      };

      const commandData = {
        operationType: OperationTypeEnum.addRowInTable,
        tableName: testTableName,
        row: row,
        primaryKey: undefined,
        tableSettings: undefined,
        page: undefined,
        perPage: undefined,
        searchedFieldValue: undefined,
        filteringFields: undefined,
        autocompleteFields: undefined,
        email: 'test@testmail.com',
      };

      const result = await commandExecutor.executeCommand({
        data: commandData,
      });
      expect(result.id).toBe(43);
    });

    it('should return deleted row primary key when call delete row in table', async () => {
      const commandExecutor = new CommandExecutor(connectionConfig);

      const commandData = {
        operationType: OperationTypeEnum.deleteRowInTable,
        tableName: testTableName,
        row: undefined,
        primaryKey: { id: 1 },
        tableSettings: undefined,
        page: undefined,
        perPage: undefined,
        searchedFieldValue: undefined,
        filteringFields: undefined,
        autocompleteFields: undefined,
        email: 'test@testmail.com',
      };

      const result = await commandExecutor.executeCommand({
        data: commandData,
      });
      expect(result[0].id).toBe(1);
      expect(result.length).toBe(1);
    });

    it('should return row by primary key when call get row by primary key', async () => {
      const commandExecutor = new CommandExecutor(connectionConfig);

      const commandData = {
        operationType: OperationTypeEnum.getRowByPrimaryKey,
        tableName: testTableName,
        row: undefined,
        primaryKey: { id: 1 },
        tableSettings: undefined,
        page: undefined,
        perPage: undefined,
        searchedFieldValue: undefined,
        filteringFields: undefined,
        autocompleteFields: undefined,
        email: 'test@testmail.com',
      };

      const result = await commandExecutor.executeCommand({
        data: commandData,
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
      expect(result[0].hasOwnProperty('name')).toBeTruthy();
      expect(result[0].hasOwnProperty('email')).toBeTruthy();
      expect(result[0].hasOwnProperty('created_at')).toBeTruthy();
      expect(result[0].hasOwnProperty('updated_at')).toBeTruthy();
    });

    it('should return all rows when call get rows ', async () => {
      const commandExecutor = new CommandExecutor(connectionConfig);

      const commandData = {
        operationType: OperationTypeEnum.getRowsFromTable,
        tableName: testTableName,
        row: undefined,
        primaryKey: undefined,
        tableSettings: {},
        page: undefined,
        perPage: undefined,
        searchedFieldValue: undefined,
        filteringFields: undefined,
        autocompleteFields: undefined,
        email: 'test@testmail.com',
      };

      const result = await commandExecutor.executeCommand({
        data: commandData,
      });
      expect(result.data.length).toBe(20);
      expect(result.hasOwnProperty('pagination'));
      expect(result.pagination.total).toBe(testEntitiesSeedsCount);
      expect(result.pagination.perPage).toBe(
        Constants.DEFAULT_PAGINATION.perPage,
      );
      expect(result.pagination.currentPage).toBe(
        Constants.DEFAULT_PAGINATION.page,
      );
      expect(result.pagination.lastPage).toBe(
        Math.ceil(
          testEntitiesSeedsCount / Constants.DEFAULT_PAGINATION.perPage,
        ),
      );
    });

    it('should return all empty foreign keys array', async () => {
      const commandExecutor = new CommandExecutor(connectionConfig);

      const commandData = {
        operationType: OperationTypeEnum.getTableForeignKeys,
        tableName: testTableName,
        row: undefined,
        primaryKey: undefined,
        tableSettings: {},
        page: undefined,
        perPage: undefined,
        searchedFieldValue: undefined,
        filteringFields: undefined,
        autocompleteFields: undefined,
        email: 'test@testmail.com',
      };

      const result = await commandExecutor.executeCommand({
        data: commandData,
      });
      expect(result.length).toBe(0);
    });

    it('should return primary keys array', async () => {
      const commandExecutor = new CommandExecutor(connectionConfig);

      const commandData = {
        operationType: OperationTypeEnum.getTablePrimaryColumns,
        tableName: testTableName,
        row: undefined,
        primaryKey: undefined,
        tableSettings: {},
        page: undefined,
        perPage: undefined,
        searchedFieldValue: undefined,
        filteringFields: undefined,
        autocompleteFields: undefined,
        email: 'test@testmail.com',
      };

      const result = await commandExecutor.executeCommand({
        data: commandData,
      });
      expect(result.length).toBe(0);
    });
  });
});
