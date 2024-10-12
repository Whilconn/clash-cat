import axios from 'axios';
import { transformUrlByMirror } from './mirrors.mjs';

const httpClient = axios.create({ timeout: 6000 });

export async function httpRequest(url, opts) {
  return httpClient(url, opts || {}).then((res) => res.data);
}

httpClient.interceptors.request.use(async (config) => {
  config.url = await transformUrlByMirror(config.url);

  return config;
});
