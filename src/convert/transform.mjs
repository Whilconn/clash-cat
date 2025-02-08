import { invokeMihomoValidate, invokeSpeedTest, invokeSubconverterByCmd } from '../../libs/invoke.mjs';
import { normalizeProxiesFile } from '../utils/proxies.mjs';

export async function transformSubFilesByLib(filePaths) {
  const ymlPath = await invokeSubconverterByCmd(filePaths);

  // 对代理节点做标准化处理，去重、过滤、改名等
  await normalizeProxiesFile(ymlPath);

  // 使用mihomo校验代理节点
  await invokeMihomoValidate(ymlPath);

  // speed test
  const aliveProxies = await invokeSpeedTest(ymlPath);

  return aliveProxies;
}
