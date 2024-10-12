import { convertToClashProxy } from './convertor.mjs';
import { resolveByUrl } from './resolver.mjs';
import { PROTOCOL } from '../utils/constant.mjs';

/**
 *
 * @param {string} proxyText
 */
export function urlToClashProxy(proxyText) {
  for (const protocol of Object.values(PROTOCOL)) {
    const prefix = `${protocol}://`;

    if (proxyText.startsWith(prefix)) {
      const proxy = resolveByUrl(proxyText, prefix);
      return convertToClashProxy(proxy, protocol);
    }
  }

  return null;
}
