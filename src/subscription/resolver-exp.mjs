import path from 'node:path';
import yaml from 'js-yaml';
import { Base64 } from 'js-base64';
import { subscriptions } from './subscriptions.mjs';
import { logger } from '../utils/logger.mjs';
import { httpRequest } from '../utils/http.mjs';
import { PATHS, PROTOCOL } from '../utils/constant.mjs';
import { normalizeProxiesFile } from '../utils/proxies.mjs';
import { urlToClashProxy } from '../proxy/index.mjs';
import { dumpProxiesYml } from '../dump/clash-yml.mjs';
import { invokeSpeedTest } from '../../libs/invoke.mjs';

function handleUrl(url) {
  return httpRequest(url).catch((err) => {
    logger.error(`请求失败：${err.message}\n  ${url}`);
  });
}

function handleYML(text) {
  return yaml.load(text);
}

function handleBase64(text) {
  return Base64.decode(text);
}

function handleHTML(text) {
  return text;
}

function isHttp(text) {
  return /^https?\:\/\//i.test(text);
}

// 只判断受支持的协议
function isProxyText(text) {
  return Object.values(PROTOCOL).some((p) => text.startsWith(`${p}://`));
}

function isBase64(text) {
  return text && Base64.isValid(text) && /^[a-z0-9=/\+]+$/i.test(text);
}

function isClashYml(text) {
  return /proxies\:\n/i.test(text);
}

// text 可能包含 base64代理文本 或 明文代理文本(如ss://)，也可能是http地址(暂不处理)
function resolveLines(text) {
  const reg = /\s|<br\/?>/;
  const lines = text.split(reg);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    lines[i] = line;

    if (!line) continue;

    if (isBase64(line)) {
      lines[i] = handleBase64(line);

      // 迭代处理 base64 递归情况
      if (reg.test(lines[i])) {
        lines.push(...lines[i].split(reg));
        lines[i] = '';
      }
    }
    // TODO: isProxyText(line) 及其他情况，暂不处理
  }

  return lines.map((l) => l.trim()).filter(Boolean);
}

const subsOrProxies = [
  ...subscriptions,
  // 暂不支持html解析
  // {
  //   url: 'https://github.com/Alvin9999/new-pac/wiki/v2ray%E5%85%8D%E8%B4%B9%E8%B4%A6%E5%8F%B7',
  //   handlers: [handleUrl, handleHTML],
  // },
];

async function extractProxies() {
  // 代理服务器信息，类型为字符串或json对象
  const proxies = [];

  const subs = subsOrProxies.map((s) => s.trim());

  for (const s of subs) {
    if (isProxyText(s)) {
      proxies.push(s);
      continue;
    }

    if (isHttp(s)) {
      const response = await handleUrl(s);

      if (isClashYml(response)) {
        const json = handleYML(response);
        proxies.push(json?.proxies || []);
        continue;
      }

      const lines = resolveLines(response);
      proxies.push(...lines);
    }
  }

  return proxies.map((p) => {
    return typeof p === 'string' ? urlToClashProxy(p) : p;
  });
}

// 自研订阅解析器，实验性功能，慎重使用
export async function resolveSubscriptionsExp() {
  // 从订阅中解析出代理节点
  const proxies = await extractProxies();

  // 将代理节点写入文件
  const date = new Date()
    .toLocaleString('zh-CN')
    .split(/\D/)
    .filter(Boolean)
    .map((c) => c.padStart(2, '0'))
    .join('');
  const ymlPath = path.resolve(PATHS.tmpDistAbs, `proxies-all-${date}.yml`);
  await dumpProxiesYml(proxies, ymlPath);

  // 对代理节点做标准化处理，去重、过滤、改名等
  await normalizeProxiesFile(ymlPath);

  // speed test
  const aliveProxies = await invokeSpeedTest(ymlPath);

  return aliveProxies;
}
