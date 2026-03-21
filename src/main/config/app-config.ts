/**
 * Application Configuration
 *
 * Environment-based config. Set REACT_APP_STAGE in your .env file:
 * - local: development against localhost backend
 * - dev: development server
 * - stage: staging/QA server
 * - prod: production
 *
 * Update the URLs below to match your backend deployment.
 */
export type ApiConfig = {
  ENDPOINT: string;
  AUTH_URL: string;
};

export type AppConfig = {
  api: ApiConfig;
  MAX_ATTACHMENT_SIZE?: number;
};

const local: AppConfig = {
  api: {
    ENDPOINT: 'http://localhost:3000/api',
    AUTH_URL: 'http://localhost:3000'
  }
};

const dev: AppConfig = {
  api: {
    ENDPOINT: 'https://dev.api.example.com/api',
    AUTH_URL: 'https://dev.api.example.com'
  }
};

const stage: AppConfig = {
  api: {
    ENDPOINT: 'https://staging.api.example.com/api',
    AUTH_URL: 'https://staging.api.example.com'
  }
};

const prod: AppConfig = {
  api: {
    ENDPOINT: 'https://api.example.com/api',
    AUTH_URL: 'https://api.example.com'
  }
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
  ...config
};

export default sharedObj;
