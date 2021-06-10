import * as WebSocket from 'ws';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandExecutor } from './command/command-executor';
import { getConnectionToDbParams } from './helpers/get-connection-to-db-params';

import { OperationTypeEnum } from './enums/operation-type.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(7007);

  const ws = new WebSocket('ws://ws-server:8008/');

  ws.on('open', function open() {
    const connectionToken = process.env.CONNECTION_TOKEN;
    const data = {
      operationType: 'initialConnection',
      connectionToken: connectionToken,
    };
    ws.send(JSON.stringify(data));
  });

  ws.on('message', async function incoming(data) {
    const messageData = JSON.parse(data);
    const {
      connectionToken,
      data: { resId },
    } = messageData;

    const connection = getConnectionToDbParams(connectionToken);
    const commandExecutor = new CommandExecutor(connection);
    const result = await commandExecutor.executeCommand(messageData);
    const responseData = {
      operationType: OperationTypeEnum.dataFromAgent,
      commandResult: result,
      resId: resId,
    };
    ws.send(JSON.stringify(responseData));
  });
}

bootstrap();
