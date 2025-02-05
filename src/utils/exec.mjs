import cp from 'node:child_process';
import { ENCODING } from './constant.mjs';
import { logger } from './logger.mjs';

export function exec(cmd, options = {}) {
  logger.info(`执行命令：${cmd}`);
  return cp.execSync(cmd, { stdio: 'inherit', encoding: ENCODING.UTF8, ...options });
}

/** 使用示例
 exec('curl https://www.baidu.com');
 */
