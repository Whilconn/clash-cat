import yaml from 'js-yaml';
import axios from 'axios';
import { Base64 } from 'js-base64';

axios.defaults.timeout = 1e4;

function extractYmlProxies(text) {
  const ymlBean = yaml.load(text);
  return ymlBean?.proxies || [];
}

function isPlainProxy(line) {
  const reg = /^(ss|ssr|vmess|vless|trojan):\/\/.+$/;
  return reg.test(line);
}

function extractPlainProxyLines(text) {
  const lines = text.replace(/[<>]/g, '\n').split('\n').filter(Boolean);

  return lines.filter(isPlainProxy);
}

function extractBase64Lines(text) {
  const lines = text.split('\n').filter(Boolean);
  const plainText = Base64.decode(lines.at(0));
  return isPlainProxy(plainText) ? lines : null;
}

export async function resolveSubscription(url) {
  let res;

  try {
    res = await axios.get(url).then((res) => res.data);
  } catch (error) {
    return null;
  }

  if (!res?.length) return null;

  try {
    const base64Lines = extractBase64Lines(res);
    const isBase64 = !!base64Lines?.length;
    if (isBase64) return { url, isBase64, base64Lines };
  } catch (error) {}

  try {
    const ymlProxies = extractYmlProxies(res);
    const isYml = !!ymlProxies?.length;
    if (isYml) return { url, isYml, ymlProxies };
  } catch (error) {}

  const plainLines = extractPlainProxyLines(res);
  const isPlain = !!plainLines?.length;
  if (isPlain) return { url, isPlain, plainLines };
}
