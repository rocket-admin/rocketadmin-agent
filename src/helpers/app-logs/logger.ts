import * as winston from 'winston';
import { CreateLogRecordDto } from './dto/create-log-record.dto';
import { LogOperationTypeEnum, OperationResultStatusEnum } from '../../enums';

export class Logger {
  private static readonly logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  public static createLogRecord(
    row: string,
    tableName: string,
    email: string,
    operationType: LogOperationTypeEnum,
    operationStatusResult: OperationResultStatusEnum,
    oldData: string,
  ): void {
    const newRecord = new CreateLogRecordDto();
    newRecord.row = row ? row : undefined;
    newRecord.table_name = tableName ? tableName : undefined;
    newRecord.email = email ? email : 'unknown';
    newRecord.operationType = operationType ? operationType : undefined;
    newRecord.operationStatusResult = operationStatusResult
      ? operationStatusResult
      : undefined;
    newRecord.old_data = oldData ? oldData : undefined;
    this.printLogRecord(newRecord);
  }

  private static printLogRecord(createLogRecordDto: CreateLogRecordDto): void {
    const log = {
      /* eslint-disable */
      received_data: createLogRecordDto.row,
      table_name: createLogRecordDto.table_name,
      user_email: createLogRecordDto.email,
      operation_time: new Date(),
      operation_type: createLogRecordDto.operationType,
      operation_status: createLogRecordDto.operationStatusResult,
      old_data: createLogRecordDto.old_data,
      /* eslint-enable */
    };
    this.logger.info(log);
  }
}
