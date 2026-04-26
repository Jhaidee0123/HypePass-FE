/**
 * HypePass — environment-based config.
 *
 * Two env vars drive this module:
 *   - REACT_APP_STAGE: local (default) | dev | stage | prod
 *   - REACT_APP_GOOGLE_MAPS_API_KEY: Google Maps JS API key (optional)
 *
 * Webpack injects them at build time via dotenv-webpack (which reads `.env`
 * locally) and via DefinePlugin/systemvars in CI (which reads `process.env`
 * — i.e. GitHub Actions secrets exported into the build step). The key is
 * NEVER committed to the repo.
 */

export type ApiConfig = {
  ENDPOINT: string;
  AUTH_URL: string;
};

export type AppConfig = {
  api: ApiConfig;
  wompiPublicKey: string;
  /**
   * Google Maps Platform JavaScript API key. Read from
   * `process.env.REACT_APP_GOOGLE_MAPS_API_KEY` at build time. Restrict the
   * key in Google Cloud Console by HTTP referrer (`hypepass.co`,
   * `localhost:8090`) and by API (Maps JS, Places, Geocoding).
   *
   * If empty, the LocationPicker falls back to manual coordinate inputs.
   */
  googleMapsApiKey: string;
  MAX_ATTACHMENT_SIZE?: number;
};

const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';

const local: AppConfig = {
  api: {
    ENDPOINT: 'http://localhost:3000/api',
    AUTH_URL: 'http://localhost:3000',
  },
  wompiPublicKey: 'pub_test_CuyBnhbgGkvg3rFgSOdMUK6vuEAh6gzv',
  googleMapsApiKey,
};

const dev: AppConfig = {
  api: {
    ENDPOINT: 'https://dev.api.hypepass.com/api',
    AUTH_URL: 'https://dev.api.hypepass.com',
  },
  wompiPublicKey: 'pub_test_CuyBnhbgGkvg3rFgSOdMUK6vuEAh6gzv',
  googleMapsApiKey,
};

const stage: AppConfig = {
  api: {
    ENDPOINT: 'https://staging.api.hypepass.com/api',
    AUTH_URL: 'https://staging.api.hypepass.com',
  },
  wompiPublicKey: 'pub_test_CuyBnhbgGkvg3rFgSOdMUK6vuEAh6gzv',
  googleMapsApiKey,
};

const prod: AppConfig = {
  api: {
    ENDPOINT: 'https://hypepass.co/api',
    AUTH_URL: 'https://hypepass.co',
  },
  wompiPublicKey: 'pub_prod_REPLACE_ME',
  googleMapsApiKey,
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
