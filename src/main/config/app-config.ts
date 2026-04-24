/**
 * HypePass — environment-based config.
 *
 * Set REACT_APP_STAGE in your .env file:
 *   - local (default) — localhost backend
 *   - dev, stage, prod — remote environments
 */

export type ApiConfig = {
  ENDPOINT: string;
  AUTH_URL: string;
};

export type AppConfig = {
  api: ApiConfig;
  wompiPublicKey: string;
  MAX_ATTACHMENT_SIZE?: number;
};

const local: AppConfig = {
  api: {
    ENDPOINT: 'http://localhost:3000/api',
    AUTH_URL: 'http://localhost:3000',
  },
  wompiPublicKey: 'pub_test_CuyBnhbgGkvg3rFgSOdMUK6vuEAh6gzv',
};

const dev: AppConfig = {
  api: {
    ENDPOINT: 'https://dev.api.hypepass.com/api',
    AUTH_URL: 'https://dev.api.hypepass.com',
  },
  wompiPublicKey: 'pub_test_CuyBnhbgGkvg3rFgSOdMUK6vuEAh6gzv',
};

const stage: AppConfig = {
  api: {
    ENDPOINT: 'https://staging.api.hypepass.com/api',
    AUTH_URL: 'https://staging.api.hypepass.com',
  },
  wompiPublicKey: 'pub_test_CuyBnhbgGkvg3rFgSOdMUK6vuEAh6gzv',
};

const prod: AppConfig = {
  api: {
    ENDPOINT: 'https://api.hypepass.com/api',
    AUTH_URL: 'https://api.hypepass.com',
  },
  wompiPublicKey: 'pub_prod_REPLACE_ME',
};

const config: AppConfig =
  process.env.REACT_APP_STAGE === 'prod'
    ? prod
    : process.env.REACT_APP_STAGE === 'stage'
    ? stage
    : process.env.REACT_APP_STAGE === 'dev'
    ? dev
    : local;

const sharedObj: AppConfig = {
  MAX_ATTACHMENT_SIZE: 5000000,
  ...config,
};

export default sharedObj;
