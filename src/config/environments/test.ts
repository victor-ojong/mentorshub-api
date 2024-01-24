import { Config, getEnvironmentValue } from '@app/config';
import { DeepPartial, Environment } from '@app/config/environments/types';

export const config: DeepPartial<Config> = {
  env: Environment.Test,

  db: {
    uri: getEnvironmentValue(
      'MONGO_URI_TEST',
      'mongodb://localhost:27017/user-auth-test'
    ),
  },

  server: {
    port: Number(getEnvironmentValue('PORT_TEST', '5555')),
  },
};
