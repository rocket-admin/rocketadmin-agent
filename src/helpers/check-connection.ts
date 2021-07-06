import { IConnection } from '../interfaces/interfaces';
import { createDao } from '../dal/shared/create-dao';

export async function checkConnection(
  connection: IConnection,
): Promise<boolean> {
  console.log('-> Test connection to database');
  const dao = createDao(connection);
  const result = await dao.testConnect();
  if (result) {
    console.log('-> Database successfully connected');
  } else {
    console.log('-> Connection to database failed');
  }
  return result;
}
