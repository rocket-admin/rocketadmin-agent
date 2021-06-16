import { createDao } from '../dal/shared/create-dao';
import { IConnection, IMessageData } from '../interfaces/interfaces';
import { Messages } from '../text/messages';
import { OperationTypeEnum } from '../enums/operation-type.enum';

export class CommandExecutor {
  private readonly connectionConfig: IConnection;

  constructor(connectionConfig: IConnection) {
    this.connectionConfig = connectionConfig;
  }

  async executeCommand(messageData: IMessageData): Promise<any> {
    const dao = createDao(this.connectionConfig);
    const {
      operationType,
      tableName,
      row,
      primaryKey,
      tableSettings,
      page,
      perPage,
      searchedFieldValue,
      filteringFields,
      autocompleteFields,
    } = messageData.data;

    switch (operationType) {
      case OperationTypeEnum.addRowInTable:
        return await dao.addRowInTable(tableName, row);
      case OperationTypeEnum.deleteRowInTable:
        return await dao.deleteRowInTable(tableName, primaryKey);
      case OperationTypeEnum.getRowByPrimaryKey:
        return await dao.getRowByPrimaryKey(
          tableName,
          primaryKey,
          tableSettings,
        );
      case OperationTypeEnum.getRowsFromTable:
        return await dao.getRowsFromTable(
          tableName,
          tableSettings,
          page,
          perPage,
          searchedFieldValue,
          filteringFields,
          autocompleteFields,
        );
      case OperationTypeEnum.getTableForeignKeys:
        return await dao.getTableForeignKeys(tableName);
      case OperationTypeEnum.getTablePrimaryColumns:
        return await dao.getTablePrimaryColumns(tableName);
      case OperationTypeEnum.getTableStructure:
        return await dao.getTableStructure(tableName);
      case OperationTypeEnum.getTablesFromDB:
        return await dao.getTablesFromDB();
      case OperationTypeEnum.testConnect:
        return await dao.testConnect();
      case OperationTypeEnum.updateRowInTable:
        return await dao.updateRowInTable(tableName, row, primaryKey);
      case OperationTypeEnum.validateSettings:
        return await dao.validateSettings(tableSettings, tableName);
      default:
        throw new Error(Messages.UNKNOWN_OPERATION(operationType));
    }
  }
}
