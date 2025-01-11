import axios from 'axios';
import { useGitHubMirror } from './gh-mirrors.mjs';

const httpClient = axios.create({ timeout: 6000 });

export async function httpRequest(url, opts) {
  return httpClient(url, opts || {}).then((res) => res.data);
}

httpClient.interceptors.request.use(async (config) => {
  config.url = useGitHubMirror(config.url);

  return config;
});
