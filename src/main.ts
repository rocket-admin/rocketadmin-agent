import * as WebSocket from 'ws';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandExecutor } from './command/command-executor';
import { getConnectionToDbParams } from './helpers/get-connection-to-db-params';

import { OperationTypeEnum } from './enums/operation-type.enum';
import { Messages } from './text/messages';
import { checkConnection } from './helpers/check-connection';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  function connect() {
    const ws = new WebSocket('wss://ws.autoadmin.org:443/');

    ws.on('open', function open() {
      const connectionToken = process.env.CONNECTION_TOKEN;
      console.log('-> Connected to the remote server');
      const data = {
        operationType: 'initialConnection',
        connectionToken: connectionToken,
      };
      ws.send(JSON.stringify(data));
    });

    ws.on('message', async function incoming(data) {
      const messageData = JSON.parse(data);
      const {
        data: { resId },
      } = messageData;
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
        ws.send(JSON.stringify(e));
      }
    });

    ws.on('close', (code, reason) => {
      console.log(
        `${Messages.SOCKET_WAS_DISCONNECTED} ${
          code ? ` With code: ${code} ` : ' '
        }`,
        reason ? `Reason: ${reason}` : '',
      );
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
  const connection = getConnectionToDbParams();

  async function tryConnectToDatabase(timeout = 2000) {
    if (await checkConnection(connection)) {
      return;
    }
    let counter = 0;
    setTimeout(async function run() {
      timeout += 2000;
      ++counter;
      const tryResult = await checkConnection(connection);
      if (tryResult) {
        return;
      } else {
        if (counter >= 6) {
          console.log(
            '-> Connection to database failed. Please check your credentials and network connection',
          );
          process.exit(0);
          return;
        }
        setTimeout(run, timeout);
      }
    }, timeout);
  }

  await tryConnectToDatabase();

  connect();
}

bootstrap();
