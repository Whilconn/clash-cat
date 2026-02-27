import fsp from 'node:fs/promises';
import { loadSubFiles } from './input';
import { logger, wrapTimeLogger } from '../utils/logger';
import { PATHS } from '../utils/constant';
import { dumpClashYml } from '../dump/clash-yml';
import { transformSubFilesByLib } from './transform';

async function ensureDistDir() {
  // await fsp.rm(PATHS.distAbs, { force: true, recursive: true });
  await fsp.mkdir(PATHS.tmpDistAbs, { recursive: true });
  await fsp.mkdir(PATHS.subDistAbs, { recursive: true });
}

async function start() {
  await ensureDistDir();

  logger.info('加载订阅文件...');
  const subFiles = await loadSubFiles();

  logger.info('解析订阅文件...');
  const proxies = await transformSubFilesByLib(subFiles);

  logger.info('保存YAML...');
  await dumpClashYml(proxies);

  return proxies;
}

await wrapTimeLogger(start, '订阅转换')();
