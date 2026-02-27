import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useGitHubMirror } from './gh-mirrors';

const httpClient = axios.create({ timeout: 6000 });

export async function httpRequest(url: string, opts?: AxiosRequestConfig) {
  return httpClient(url, opts || {}).then((res) => res.data);
}

httpClient.interceptors.request.use(async (config: InternalAxiosRequestConfig<unknown>) => {
  config.url = useGitHubMirror(config.url);

  return config;
});
