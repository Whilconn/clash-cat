import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import ping from 'ping';
import { logger } from '../src/utils/logger.mjs';
import { exec } from '../src/utils/exec.mjs';
import { runBatch } from '../src/utils/task.mjs';
import { ENCODING, PATHS } from '../src/utils/constant.mjs';
import { LIB_LITE, LIB_MIHOMO, LIB_SUBCONVERTER } from './libs.mjs';

const execOpts = { cwd: PATHS.tmpDistAbs };

function validateByMihomo(clashYmlPath) {
  const appPath = path.resolve(PATHS.pkgsAbs, LIB_MIHOMO.appPath);
  const cmd = `${appPath} -t -f ${clashYmlPath}`;

  try {
    exec(cmd, { ...execOpts, stdio: '' });
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

    // await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

/**
 * 使用示例：
 * invokeMihomoValidate('/home/whilconn/workspaced9/clash-cat/dist/tmp/proxies-all-20250111104120.yml');
 */

export async function invokeSpeedTest(clashYmlPath) {
  const appPath = path.resolve(PATHS.pkgsAbs, LIB_LITE.appPath);
  const configPath = path.resolve(PATHS.libsAbs, 'lite-speed-test-config.json');
  const cmd = `${appPath} --config ${configPath} --test ${clashYmlPath}`;
  exec(cmd, execOpts);

  const speedJsonPath = path.resolve(PATHS.tmpDistAbs, 'output.json');
  const speedText = await fsp.readFile(speedJsonPath, ENCODING.UTF8);
  const speedJson = speedText ? JSON.parse(speedText) : {};

  const aliveProxyNameSet = speedJson.nodes.reduce((set, node) => {
    return node.isok && set.add(node.remarks), set;
  }, new Set());

  const clashYmlText = await fsp.readFile(clashYmlPath, ENCODING.UTF8);
  const proxies = yaml.load(clashYmlText)?.proxies || [];

  return proxies.filter((p) => aliveProxyNameSet.has(p.name));
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
  const ymlPath = await dumpSubConvertConfig(subscriptionUrls);

  const appPath = path.resolve(PATHS.pkgsAbs, LIB_SUBCONVERTER.appPath);
  const cmd = `${appPath} -g`;
  exec(cmd, execOpts);

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
