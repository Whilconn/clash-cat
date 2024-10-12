import { generateSubscriptions } from './subscriptions.mjs';
import { invokeSpeedTest, invokeSubconverterByCmd } from '../../libs/invoke.mjs';
import { normalizeProxiesFile } from '../utils/proxies.mjs';

export async function resolveSubscriptionsByLib() {
  const subUrls = await generateSubscriptions();
  const ymlPath = await invokeSubconverterByCmd(subUrls);

  // 对代理节点做标准化处理，去重、过滤、改名等
  await normalizeProxiesFile(ymlPath);

  // speed test
  const aliveProxies = await invokeSpeedTest(ymlPath);

  return aliveProxies;
}
