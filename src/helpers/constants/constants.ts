export const Constants = {
  FORBIDDEN_HOSTS: [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '127.0.0.0/8',
    'fd00::/8',
  ],

  DEFAULT_PAGINATION: { page: 1, perPage: 20 },
  KEEP_ALIVE_INTERVAL: 30000,
  KEEP_ALIVE_COUNT_MAX: 120,
  DEFAULT_CONNECTION_CACHE_OPTIONS: {
    max: 50,
    length: function (n, key) {
      return n * 2 + key.length;
    },
    dispose: async function (key, n) {
      await n.destroy();
    },
    maxAge: 1000 * 60 * 60,
  },

  DEFAULT_TUNNEL_CACHE_OPTIONS: {
    max: 10000,
    length: function (n, key) {
      return n * 2 + key.length;
    },
    dispose: async function (key, n) {
      await n.knex.destroy();
      await n.tnl.close();
    },
    maxAge: 1000 * 60 * 60,
  },

  DEFAULT_DRIVER_CACHE_OPTIONS: {
    max: 50,
    length: function (n, key) {
      return n * 2 + key.length;
    },
    dispose: function (key, n) {
      return 1;
    },
    maxAge: 1000 * 60 * 60,
  },

  DEFAULT_SETTINGS_CACHE_OPTIONS: {
    max: 1000,
    length: function (n, key) {
      return n * 2 + key.length;
    },
    dispose: function (key, n) {
      return 1;
    },
    maxAge: 1000 * 60 * 60,
  },

  DEFAULT_CONNECTIONS_CACHE_OPTIONS: {
    max: 1000,
    length: function (n, key) {
      return n * 2 + key.length;
    },
    dispose: function (key, n) {
      return 1;
    },
    maxAge: 1000 * 60 * 60,
  },

  DEFAULT_FORWARD_IN_HOST: '127.0.0.1',
  AUTOCOMPLETE_ROW_LIMIT: 20,

  TEST_CONNECTION_TO_POSTGRES: {
    title: 'Test connection to Postgres.',
    type: 'postgres',
    username: 'crud_user',
    password: 'z5mehBNApNdUpX',
    host: 'autoadmin-test-db.cvfuxe8nltiq.us-east-2.rds.amazonaws.com',
    port: 5432,
    database: 'testdb',
  },

  TEST_CONNECTION_TO_MSSQL: {
    title: 'Test connection to MSSQL',
    masterEncryption: false,
    type: 'mssql',
    host: 'database-3.cvfuxe8nltiq.us-east-2.rds.amazonaws.com',
    port: 1433,
    password: 'YtytoT5xajUUXzoDM5',
    username: 'crud_user_2',
    database: 'mssql-test',
    ssh: false,
    ssl: false,
  },

  TEST_CONNECTION_TO_ORACLE: {
    title: 'Test connection to OracleDB',
    type: 'oracledb',
    host: 'database-1.cvfuxe8nltiq.us-east-2.rds.amazonaws.com',
    port: 1521,
    username: 'crud_user',
    password: 'P2RihBTHUJmnWX7BaC',
    database: 'ADMIN',
    sid: 'ORCL',
  },

  TEST_SSH_CONNECTION_TO_MYSQL: {
    title: 'Test connection via SSH tunnel to mySQL',
    type: 'mysql',
    host: 'database-2.cvfuxe8nltiq.us-east-2.rds.amazonaws.com',
    port: 3306,
    username: 'crud_user',
    password: 'XfHLgtxTy3cuwFrn3X',
    database: 'testDB',
    ssh: true,
    sshHost: '3.134.99.192',
    sshPort: '22',
    sshUsername: 'ubuntu',
    privateSSHKey:
      '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAo2GGo1Y4gpzEeIsDmYfbHKss0LrawJda+meBXrzkkHhEprln\nFyKWGEyHyLF0Pfr0afmgvub6fFUaZeBNZDLNIcdM15+yPa7uTtlfhfpsgFYMjtiV\nlmwNElJfN3glKkLavlLPyFatN0MAoc3oxuipZVQEyTLo2Y3BMhFS0LnS4LEXGIJe\nKi6Nd3cMiMu0pEz9q8so59FOOGhdo+HnghnntZInOTObb3aHo0fGkObDXy5E286G\n8zI5CJI8wwnfYjCGk1khRcoBV7qYLN4rSWN/lmLZmj9cVrsamP7ICi3YSGJJU/LA\n39sGTnt/DoJOl/Q9PZzkyC2EHWtksMGQjOZ2lQIDAQABAoIBABSOktg+YwHcI8Rf\nCWbp9yHWT987g4a0BJh5KYf4EHI1D75CmbwJeAU6q+MOoOejidlDtXwPp/i45Ido\n/5PZ6IGViA+hYlXsisOVCjXbWoeTTCU1Dy1MDyD9CEn8bgCxRMCpvscgUM8hORUi\nyWUtpRLAzZFbPH0THvnjwB3PI79tlVk+92mlxd+cn0d2ZQyd5JQQuzp6suNIFne3\nB+3ge/13Ojw+oiyHg9YnM/n0YEzLLMyiUljXhiQKbFqQ6I2DXaPJLgC6nrRpNFXX\nAIncBHJ9jzXlOdcC6sboZOVNrm00q8HaYblEcUEpHguNpQ0Us7mblJmPzgMqv0Rw\n93w6H4kCgYEAzJ1clUDQUJoF6YKWFMtatdsXgOr1DsP3GwdFPwPqoDxj2+Wn7NHt\ngG47IHN+NL2Axp1C32bFHboGsQCNq/EhZh/9gXxlRV4DgY97qW8LoJCI1EFruhOT\nYyOisD7tmrW34wZz2LlcAA8UuzTYNs2jl20oUIGa9JM/mvwT8DZLhGMCgYEAzGlB\ndPIl77SSJDOLunP1KWRf+tdcHL8rWpW8Rf0luKqRNspsIIQGkHAgo1jRe4iMGdl9\nOA9BXUK6+JLyUygqyI53UrwmGjJ4CwiS7R5wgv0YveXCUZlgKeWlPe1SIYrexjdy\n/6Gt0xjkxZFmhPw+XjbNbLA9A08JgBdlKzK6nqcCgYEAqEXt4w0nhHH21MBBPx6y\nHgbtgGc6XAdLjB3hk95bsaWYljp7bKaEhO+ijqCMtUD3y99/JIy3JShc4mpLGJG4\n3u0GJdwwyOh1R7LBh2k8jbLv5Gdc+e2pc4nV/M3zyB0T+o/O6/gcsiu05/SgsAlU\nNW9fDT5ZOjRyxbnzh8SPPHMCgYAXN81rjyWn+Iaw/fndD9bFANW2FEguK7is7V0Z\nRgvG0fj0lEF74AMu3M2YQDprIbNoLEAA4hq2kSHToj1MHL/fT+9VwnFBgIIKHssx\ni8eT2VO6HiLYSeeWWrNOOWqezLtJIHs7dg3ccHNrzXwrlssuwGLM+ae0fIHDvuSK\n55Qy+QKBgEIRdMhN0jcqUl/VyTfYSR4Nssskscyk+ctub5mvCzYogrE3p0Sg1QX9\nOV7m+BOqq2TRsfvUBig5Li0YdvIneoaQlMlcLj2ikKAEFMDnodGzVc8JGT8WEiAL\nvo91V6emt2P7xj8dXtuevYIhQqVgvX338zMh+fAwdTL+FjqReMaw\n-----END RSA PRIVATE KEY-----',
  },

  getTestConnectionsArr: function () {
    const testConnections = [];
    testConnections.push(
      this.TEST_CONNECTION_TO_ORACLE,
      this.TEST_CONNECTION_TO_POSTGRES,
      this.TEST_SSH_CONNECTION_TO_MYSQL,
      this.TEST_CONNECTION_TO_MSSQL,
    );
    return testConnections;
  },

  getTestConnectionsHostNamesArr: function () {
    return this.getTestConnectionsArr().map((connection) => connection.host);
  },
};
