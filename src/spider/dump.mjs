import path from 'node:path';
import fsp from 'node:fs/promises';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import { Base64 } from 'js-base64';
import { runBatch } from '../utils/task.mjs';
import { ENCODING, PATHS, SUB_PREFIX } from '../utils/constant.mjs';
import { exec } from '../utils/exec.mjs';

function genFileName(prefix, extName) {
  if (!extName) extName = 'txt';
  const rdm = crypto.randomBytes(5).toString('hex');
  return `${prefix}-${rdm}.${extName}`;
}

async function dumpBase64(base64Lines) {
  const fileName = genFileName(SUB_PREFIX.BASE64);
  const filePath = path.resolve(PATHS.subDistAbs, fileName);
  const content = base64Lines.join('\n');

  return fsp.writeFile(filePath, content, ENCODING.UTF8);
}

function dumpPlainText(plainLines) {
  const fileName = genFileName(SUB_PREFIX.PLAIN);
  const filePath = path.resolve(PATHS.subDistAbs, fileName);
  const content = Base64.encode(plainLines.join('\n'));

  return fsp.writeFile(filePath, content, ENCODING.UTF8);
}

async function dumpYml(ymlProxies) {
  const fileName = genFileName(SUB_PREFIX.YML, 'yml');
  const filePath = path.resolve(PATHS.subDistAbs, fileName);
  const content = yaml.dump({ proxies: ymlProxies });

  return fsp.writeFile(filePath, content, ENCODING.UTF8);
}

function compress() {
  const pwd = process.env.MY_PWD;
  if (!pwd) throw new Error('pwd缺失');

  const sourceDir = path.resolve(PATHS.subDistAbs, '*');
  const zipPath = path.resolve(PATHS.distAbs, 'sub.zip');
  const cmd = `zip -P ${pwd} -j ${zipPath} ${sourceDir}`;
  exec(cmd);
}

async function dump(resolvedSub) {
  if (resolvedSub.isBase64) {
    // { url, isBase64, base64Lines }
    return dumpBase64(resolvedSub.base64Lines);
  } else if (resolvedSub.isPlain) {
    // { url, isPlain, plainLines }
    return dumpPlainText(resolvedSub.plainLines);
  } else if (resolvedSub.isYml) {
    // { url, isYml, ymlProxies }
    return dumpYml(resolvedSub.ymlProxies);
  }
}

export async function dumpResolvedSubs(resolvedSubs) {
  const tasks = resolvedSubs.map((s) => dump(s));
  await runBatch(tasks, 10);
  compress();
}
