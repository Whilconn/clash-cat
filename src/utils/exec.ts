import cp, { ExecSyncOptions } from 'node:child_process';
import { ENCODING } from './constant';
import { logger } from './logger';

export function exec(cmd: string, options: ExecSyncOptions = {}) {
  logger.info(`执行命令：${cmd}`);
  return cp.execSync(cmd, { stdio: 'inherit', encoding: ENCODING.UTF8, ...options });
}

/** 使用示例
 exec('curl https://www.baidu.com');
 */
