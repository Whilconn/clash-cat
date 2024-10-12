import path from 'node:path';
import fsp from 'node:fs/promises';
import { Base64 } from 'js-base64';
import { ENCODING, PATHS } from '../utils/constant.mjs';
import { httpRequest } from '../utils/http.mjs';
import { transformUrlByMirror } from '../utils/mirrors.mjs';
import { logger } from '../utils/logger.mjs';

const localSubFile = path.resolve(PATHS.tmpDistAbs, 'local-sub.txt');

const proxyUrls = [];

export const subscriptions = [];

async function proxyToSub(urlList) {
  const proxyTexts = [];
  const reg = /^(ss|ssr|vmess|vless|trojan):\/\/.+$/;

  for (const url of urlList) {
    const res = await httpRequest(url);
    const lines = res.replace(/[<>]/g, '\n').split('\n');

    for (const l of lines) {
      if (reg.test(l)) proxyTexts.push(l);
    }
  }

  const subText = Base64.encode(proxyTexts.join('\n'));

  return fsp.writeFile(localSubFile, subText, ENCODING.UTF8);
}

export async function generateSubscriptions() {
  logger.info('处理订阅链接...');

  const urls = await Promise.all(proxyUrls.map((s) => transformUrlByMirror(s)));
  const mirroredSubs = await Promise.all(subscriptions.map((s) => transformUrlByMirror(s)));
  await proxyToSub(urls);

  return [...mirroredSubs, localSubFile];
}
