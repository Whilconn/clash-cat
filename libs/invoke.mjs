import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import ping from 'ping';
import { exec } from '../src/utils/exec.mjs';
import { ENCODING, PATHS } from '../src/utils/constant.mjs';
import { LIB_LITE, LIB_SUBCONVERTER } from './libs.mjs';

const execOpts = { cwd: PATHS.tmpDistAbs };

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
export async function invokeSpeedTest2(clashYmlPath) {
  const clashYmlText = await fsp.readFile(clashYmlPath, ENCODING.UTF8);
  const proxies = yaml.load(clashYmlText)?.proxies || [];

  const pingTasks = proxies.map((p) => {
    return ping.promise.probe(p.server, { timeout: 2, min_reply: 1 });
  });

  const pingResults = await Promise.all(pingTasks);
  return proxies.filter((_, i) => pingResults[i].alive);
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
