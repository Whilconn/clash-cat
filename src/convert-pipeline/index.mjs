import fsp from 'node:fs/promises';
import { loadSubFiles } from './input.mjs';
import { logger } from '../utils/logger.mjs';
import { PATHS } from '../utils/constant.mjs';
import { dumpClashYml } from '../dump/clash-yml.mjs';
import { transformSubFilesByLib } from './transform.mjs';

function wrapTimeLogger(fn, actionName) {
  return async (...args) => {
    logger.info(`${actionName}...`);
    const time = Date.now();

    const res = await fn(...args);

    logger.info(`${actionName}耗时：${((Date.now() - time) / 1000).toFixed(2)} s`);

    return res;
  };
}

async function ensureDistDir() {
  await fsp.rm(PATHS.distAbs, { force: true, recursive: true });
  await fsp.mkdir(PATHS.tmpDistAbs, { recursive: true });
  await fsp.mkdir(PATHS.subDistAbs, { recursive: true });
}

async function start() {
  await ensureDistDir();

  const subFiles = await wrapTimeLogger(loadSubFiles, '加载订阅文件')();
  const proxies = await wrapTimeLogger(transformSubFilesByLib, '解析节点')(subFiles);
  await wrapTimeLogger(dumpClashYml, '写入文件')(proxies);

  return proxies;
}

start();
