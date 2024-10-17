import fsp from 'node:fs/promises';
import { logger } from './utils/logger.mjs';
import { PATHS } from './utils/constant.mjs';
import { dumpClashYml } from './dump/clash-yml.mjs';
import { resolveSubscriptionsByLib } from './subscription/resolver-lib.mjs';
import { resolveSubscriptionsExp } from './subscription/resolver-exp.mjs';

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
  await fsp.mkdir(PATHS.localAbs, { recursive: true });
}

async function start() {
  await ensureDistDir();

  const proxies = await wrapTimeLogger(resolveSubscriptionsByLib, '解析节点')();
  // const proxies = await wrapTimeLogger(resolveSubscriptionsExp, '解析节点')();
  await wrapTimeLogger(dumpClashYml, '写入文件')(proxies);

  return proxies;
}

start();
