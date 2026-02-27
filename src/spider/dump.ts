import path from 'node:path';
import fsp from 'node:fs/promises';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import { Base64 } from 'js-base64';
import { runBatch } from '../utils/task';
import { ENCODING, PATHS, SUB_PREFIX } from '../utils/constant';

function genFileName(prefixName: string, fileContent: string, extName?: string) {
  if (!extName) extName = 'txt';

  // 生成摘要
  const digest = crypto.createHash('md5').update(fileContent).digest('base64url');

  return `${prefixName}-${digest}.${extName}`;
}

async function dumpBase64(base64Lines: string[]) {
  const content = base64Lines.join('\n');
  const fileName = genFileName(SUB_PREFIX.BASE64, content);
  const filePath = path.resolve(PATHS.subDistAbs, fileName);

  return fsp.writeFile(filePath, content, ENCODING.UTF8);
}

function dumpPlainText(plainLines: string[]) {
  const content = Base64.encode(plainLines.join('\n'));
  const fileName = genFileName(SUB_PREFIX.PLAIN, content);
  const filePath = path.resolve(PATHS.subDistAbs, fileName);

  return fsp.writeFile(filePath, content, ENCODING.UTF8);
}

async function dumpYml(ymlProxies: ProxyNode[]) {
  const content = yaml.dump({ proxies: ymlProxies });
  const fileName = genFileName(SUB_PREFIX.YML, content, 'yml');
  const filePath = path.resolve(PATHS.subDistAbs, fileName);

  return fsp.writeFile(filePath, content, ENCODING.UTF8);
}

async function dump(resolvedSub: ResolvedSub) {
  if ('isBase64' in resolvedSub && resolvedSub.isBase64) {
    // { url, isBase64, base64Lines }
    return dumpBase64(resolvedSub.base64Lines);
  } else if ('isPlain' in resolvedSub && resolvedSub.isPlain) {
    // { url, isPlain, plainLines }
    return dumpPlainText(resolvedSub.plainLines);
  } else if ('isYml' in resolvedSub && resolvedSub.isYml) {
    // { url, isYml, ymlProxies }
    return dumpYml(resolvedSub.ymlProxies);
  }
}

export async function dumpResolvedSubs(resolvedSubs: ResolvedSub[]) {
  const tasks = resolvedSubs.map((s) => dump(s));
  await runBatch(tasks, 10);
}
