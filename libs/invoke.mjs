import fsp from 'node:fs/promises';
import path from 'node:path';
import cp from 'node:child_process';
import yaml from 'js-yaml';
import ping from 'ping';
import { logger } from '../src/utils/logger.mjs';
import { exec } from '../src/utils/exec.mjs';
import { runBatch } from '../src/utils/task.mjs';
import { ENCODING, PATHS } from '../src/utils/constant.mjs';
import { LIB_LITE, LIB_MIHOMO, LIB_SUBCONVERTER } from './libs.mjs';

const execOpts = { cwd: PATHS.tmpDistAbs, stdio: 'pipe' };

function validateByMihomo(clashYmlPath) {
  logger.info('校验节点...');
  const appPath = path.resolve(PATHS.pkgsAbs, LIB_MIHOMO.appPath);
  const cmd = `${appPath} -t -f ${clashYmlPath}`;

  try {
    exec(cmd, execOpts);
  } catch (err) {
    /**
     * err.stdout example:
     * "time=\"2025-01-13T10:02:41.970502890+08:00\" level=info msg=\"Start initial configuration in progress\"\ntime=\"2025-01-13T10:02:41.976557666+08:00\" level=error msg=\"proxy 249: ss series-a2-me.samanehha.co:443 initialize error: unknown method: chacha20-poly1305\"\nconfiguration file /home/whilconn/workspaced9/clash-cat/dist/tmp/proxies-all-20250111104120.yml test failed\n"
     */

    logger.info(`Mihomo检测到代理节点异常：${err.stdout}`);

    const errReg = /level=error msg="[^"]*\s([\S.]+:\d+)\s[^"]*"/;
    const errorHosts = err.stdout
      .split('\n')
      .map((s) => {
        const match = s.match(errReg);
        return match?.length ? match[1] : '';
      })
      .filter(Boolean);

    return errorHosts;
  }
}

export async function invokeMihomoValidate(ymlPath) {
  if (!ymlPath) return;

  while (true) {
    const clashYmlText = await fsp.readFile(ymlPath, ENCODING.UTF8);
    const ymlBean = yaml.load(clashYmlText);

    if (!ymlBean?.proxies?.length) return;

    const errorHosts = validateByMihomo(ymlPath) || [];

    if (!errorHosts.length) return;

    ymlBean.proxies = ymlBean.proxies.filter((p) => {
      return !errorHosts.includes(`${p.server}:${p.port}`);
    });

    const ymlText = yaml.dump(ymlBean);
    await fsp.writeFile(ymlPath, ymlText, ENCODING.UTF8);
  }
}

/**
 * 使用示例：
 * invokeMihomoValidate('/home/whilconn/workspaced9/clash-cat/dist/tmp/proxies-all-20250111104120.yml');
 */

export async function invokeSpeedTest(clashYmlPath) {
  logger.info('节点测速...');

  const appPath = path.resolve(PATHS.pkgsAbs, LIB_LITE.appPath);
  const configPath = path.resolve(PATHS.libsAbs, 'lite-speed-test-config.json');
  const appArgs = ['--config', configPath, '--test', clashYmlPath];

  logger.info(`测速命令：${[appPath, ...appArgs].join(' ')}`);

  const clashYmlText = await fsp.readFile(clashYmlPath, ENCODING.UTF8);
  const proxies = yaml.load(clashYmlText)?.proxies || [];

  return new Promise((resolve, reject) => {
    const child = cp.spawn(appPath, appArgs, execOpts);
    const output = [];

    const handleOutput = (content) => {
      output.push(content);

      if (!content.includes(`"info":"eof"`)) return;

      resolve(output.join(''));

      setTimeout(() => {
        child.kill('SIGTERM');
      }, 1000);
    };

    // 监听标准输出
    child.stdout.on('data', (data) => {
      handleOutput(data.toString());
    });

    // 监听标准错误
    child.stderr.on('data', (data) => {
      handleOutput(data.toString());
    });

    // 监听错误
    child.on('error', (error) => {
      reject(error);
    });
  }).then((log) => {
    logger.info('测速完成，过滤节点...');

    const lines = log.split('\n').filter(Boolean);

    // 示例：2025/02/05 18:05:09 66 广东省广州市8vzqw recv: 3.7MB/s
    const aliveProxyLines = lines.filter((l) => l.includes(`recv:`)) || [];
    const aliveProxyNames = aliveProxyLines.map((l) => {
      return l
        .slice(20)
        .replace(/^\d+\s+/, '')
        .replace(/\s+recv\:.+$/, '');
    });
    const aliveProxyNameSet = new Set(aliveProxyNames);

    logger.info(`可用节点 ${aliveProxyNameSet.size} 个：${[...aliveProxyNameSet].join()}`);

    return proxies.filter((p) => aliveProxyNameSet.has(p.name));
  });
}

// lite speed test 出错时的备用方案
export async function pingTest(clashYmlPath) {
  const clashYmlText = await fsp.readFile(clashYmlPath, ENCODING.UTF8);
  const proxies = yaml.load(clashYmlText)?.proxies || [];

  const pingTasks = proxies.map((p) => {
    return ping.promise.probe(p.server, { timeout: 2, min_reply: 1 });
  });

  const pingResults = await runBatch(pingTasks, 100);
  const aliveProxies = proxies.filter((_, i) => pingResults[i]?.alive);

  const filePath = clashYmlPath.replace('all', 'ping');
  const ymlText = yaml.dump({ proxies: aliveProxies });
  await fsp.writeFile(filePath, ymlText, ENCODING.UTF8);

  return filePath;
}

async function dumpSubConvertConfig(subscriptionUrls) {
  const date = new Date()
    .toLocaleString('zh-CN')
    .split(/\D/)
    .filter(Boolean)
    .map((c) => c.padStart(2, '0'))
    .join('');
  const ymlPath = path.resolve(PATHS.tmpDistAbs, `proxies-all-${date}.yml`);

  const configLines = ['[clash]', 'url=' + subscriptionUrls.join('|'), 'target=clash', 'path=' + ymlPath, 'list=true'];
  const configPath = path.resolve(PATHS.pkgsAbs, LIB_SUBCONVERTER.generateIniPath);
  await fsp.writeFile(configPath, configLines.join('\n'), ENCODING.UTF8);

  return ymlPath;
}

/**
 * 文件路径或链接数组
 * @param {Array<string>} subscriptionUrls
 * @returns {string}
 */
export async function invokeSubconverterByCmd(subscriptionUrls) {
  logger.info('转译订阅文件...');

  const ymlPath = await dumpSubConvertConfig(subscriptionUrls);

  const appPath = path.resolve(PATHS.pkgsAbs, LIB_SUBCONVERTER.appPath);
  const cmd = `${appPath} -g`;

  try {
    exec(cmd, { ...execOpts, stdio: 'ignore' });
  } catch (error) {
    const msg = error?.stack || error?.message || error?.stdout;
    logger.error(`转译订阅文件出错：\n${msg}`);
  }

  return ymlPath;
}

// 在线服务不稳定，不推荐使用
export function invokeSubconverterByHttp(subscriptionUrls, serviceHost = 'https://sub.xeton.dev/sub') {
  const params = new URLSearchParams({
    url: subscriptionUrls.join('|'),
    target: 'clash',
    list: true,
    new_name: true,
    tfo: false,
    scv: false,
    fdn: false,
    sort: false,
    emoji: false,
    insert: false,
  });

  const url = `${serviceHost}?${params.toString()}`;
  return httpRequest(url).catch((err) => {
    logger.error(`解析失败：${err.message}\n  ${subscriptionUrls.toString()}\n  ${url}`);
  });
}
