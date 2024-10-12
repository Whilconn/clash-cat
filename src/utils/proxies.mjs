import fsp from 'node:fs/promises';
import yaml from 'js-yaml';
import { ENCODING } from './constant.mjs';

function isProxyValid(proxy) {
  //check server
  const notValid1 = !/^.+[.].+[.].+$/.test(proxy.server);
  const notValid2 = ['127.0.0.1'].includes(proxy.server);
  if (notValid1 || notValid2) return false;

  //check port and password
  return /^\d+$/.test(proxy.port) && /^[\u0020-\u007e]+$/.test(proxy.password);
}

function formatName(name) {
  const K = 6;
  // 剔除空格、emoji国旗
  name = name.replace(/\s|\ud83c[\ud000-\udfff](\ud83c[\ud000-\udfff])?/g, '');
  // 剔除英文、标点符号
  if (!/^[\u0020-\u007e]+$/.test(name)) name = name.replace(/[\u0020-\u007e]/g, '');
  return name.slice(0, K).padEnd(K, '-') + ((Math.random() * 1e8) >>> 0).toString(36);
}

// filter and format proxies
function normalizeProxies(proxies) {
  const hostSet = new Set();
  const validProxies = [];

  for (const proxy of proxies) {
    const key = `${proxy.server}:${proxy.port}`;

    // 跳过重复，非法代理
    if (hostSet.has(key) || !isProxyValid(proxy)) continue;

    hostSet.add(key);
    proxy.name = formatName(proxy.name);

    validProxies.push(proxy);
  }

  return validProxies;
}

// 剔除 yaml 中的异常内容
function normalizeYmlText(ymlText) {
  const invalidPatterns = ['!<str> '];

  for (const p of invalidPatterns) {
    ymlText = ymlText.replaceAll(p, '');
  }

  return ymlText;
}

export async function normalizeProxiesFile(ymlPath) {
  let clashYmlText = await fsp.readFile(ymlPath, ENCODING.UTF8);
  clashYmlText = normalizeYmlText(clashYmlText);

  const ymlBean = yaml.load(clashYmlText) || {};
  ymlBean.proxies = normalizeProxies(ymlBean.proxies || []);

  const ymlText = yaml.dump(ymlBean);
  return fsp.writeFile(ymlPath, ymlText, ENCODING.UTF8);
}
