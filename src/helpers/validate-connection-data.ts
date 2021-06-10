import { Messages } from '../text/messages';

export function validateConnectionData(connectionData): Array<string> {
  const errors = [];
  if (!connectionData.type) errors.push(Messages.TYPE_MISSING);
  if (!connectionData.host) errors.push(Messages.HOST_MISSING);
  if (
    connectionData.port < 0 ||
    connectionData.port > 65535 ||
    !connectionData.port
  )
    errors.push(Messages.PORT_MISSING);
  if (typeof connectionData.port !== 'number')
    errors.push(Messages.PORT_FORMAT_INCORRECT);
  if (!connectionData.username) errors.push(Messages.USERNAME_MISSING);
  if (!connectionData.database) errors.push(Messages.DATABASE_MISSING);
  if (typeof connectionData.ssh !== 'boolean')
    errors.push(Messages.SSH_FORMAT_INCORRECT);
  if (connectionData.ssh) {
    if (!connectionData.sshPort) errors.push(Messages.SSH_PORT_MISSING);
    if (!connectionData.sshUsername) errors.push(Messages.SSH_USERNAME_MISSING);
    if (!connectionData.sshHost) errors.push(Messages.SSH_HOST_MISSING);
  }
  if (!connectionData.token) errors.push(Messages.CONNECTION_TOKEN_MISSING);
  return errors;
}
