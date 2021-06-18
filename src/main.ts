import * as WebSocket from 'ws';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandExecutor } from './command/command-executor';
import { getConnectionToDbParams } from './helpers/get-connection-to-db-params';

import { OperationTypeEnum } from './enums/operation-type.enum';
import { Messages } from './text/messages';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  function connect() {
    const ws = new WebSocket('wss://ws.autoadmin.org:443/');

    ws.on('open', function open() {
      const connectionToken = process.env.CONNECTION_TOKEN;
      console.log('-> Connected to the server');
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
      try {
        const result = await commandExecutor.executeCommand(messageData);
        const responseData = {
          operationType: OperationTypeEnum.dataFromAgent,
          commandResult: result,
          resId: resId,
        };
        ws.send(JSON.stringify(responseData));
      } catch (e) {
        ws.send(e);
      }
    });

    ws.on('close', () => {
      console.log(Messages.SOCKET_WAS_DISCONNECTED);
      setTimeout(() => {
        connect();
      }, 1000);
    });

    ws.on('error', (e) => {
      console.error(Messages.SOCKET_ENCOUNTERED_ERROR(e.message));
      ws.close();
    });
  }

  console.log('-> Application started');
  connect();
}

bootstrap();
