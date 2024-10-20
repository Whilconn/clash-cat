import yaml from 'js-yaml';
import axios from 'axios';
import { Base64 } from 'js-base64';
import { runBatch } from '../utils/task.mjs';

axios.defaults.timeout = 1e4;

function extractYmlProxies(text) {
  const ymlBean = yaml.load(text);
  return ymlBean?.proxies || [];
}

function extractPlainProxyLines(text) {
  // 避免 html干扰
  text = text.replace(/[<>]/g, '\n');
  const lines = text.split('\n').map((s) => s.trim());

  const reg = /^(ss|ssr|vmess|vless|trojan):\/\/.+$/;
  return lines.filter((l) => l && reg.test(l));
}

function extractBase64Lines(text) {
  const lines = text.split('\n').filter(Boolean);
  const plainText = Base64.decode(lines.at(0)).trim();
  const reg = /^(ss|ssr|vmess|vless|trojan):\/\/.+/;
  return reg.test(plainText) ? lines : null;
}

async function resolveSubscription(url) {
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

export async function resolveSubscriptions(subLinks) {
  const tasks = subLinks.map((l) => resolveSubscription(l));
  const results = await runBatch(tasks, 10);

  return results.filter((r) => r && !(r instanceof Error));
}
