import { Base64 } from 'js-base64';
import { PROTOCOL } from '../utils/constant.mjs';

/***************************************** utils *****************************************/

/**
 * @param {URL} url
 */
function getHash(url) {
  return decodeURIComponent((url.hash || '').slice(1));
}

/**
 * @param {URL} url
 */
function searchParamsToObject(url) {
  const params = url.searchParams;
  const obj = {};
  const keys = params.keys();

  for (const key of keys) {
    const value = params.getAll(key);
    if (value === null || value === undefined) continue;

    obj[key] = value.length > 1 ? value : value[0];
  }

  return obj;
}

function decodeUrlPart(text) {
  const isValid = text && Base64.isValid(text) && /^[a-z0-9=/\+]+$/i.test(text);
  return isValid ? Base64.decode(text) : text;
}

function decodeUrl(proxyText, prefix) {
  proxyText = proxyText.slice(prefix.length);

  // 特殊情况：将/#、/?等特殊情况中的 / 剔除
  proxyText = proxyText.replace(/\/(\#|\?)/g, '$1');

  // 按顺序依次拆分出# ? @参数
  const parts = [];
  for (const c of ['#', '?', '@']) {
    const [p1, p2] = proxyText.split(c);

    if (p2) parts.push(decodeUrlPart(p2), c);

    proxyText = p1;
  }
  proxyText = decodeUrlPart(proxyText);
  parts.push(proxyText, prefix);

  return parts.reverse().join('');
}

/***************************************** resolver *****************************************/

function resolveVmess(proxyText, prefix) {
  proxyText = proxyText.slice(prefix.length);
  proxyText = Base64.decode(proxyText);

  return JSON.parse(proxyText);
}

// 格式：vmess://base64
// 格式：ss://method:password@server:port?search-params#server-name
// 格式：ssr://method:password@server:port?search-params#server-name
// 格式：trojan://username:password@server:port?search-params#server-name
// 编码：可能全明文，可能部分 或 全文 base64编码
// 示例：ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTp1MTdUM0J2cFlhYWl1VzJj@series-a2-mec.samanehha.co:443#%E2%86%96%EF%B8%8F2%40oneclickvpnkeys

export function resolveByUrl(proxyText, prefix) {
  if (prefix.startsWith(PROTOCOL.vmess)) return resolveVmess(proxyText, prefix);

  proxyText = decodeUrl(proxyText, prefix);
  const url = new URL(proxyText);

  const name = getHash(url) || url.hostname;
  const searchParams = searchParamsToObject(url);

  return {
    name,
    server: url.hostname,
    port: url.port,
    cipher: url.username,
    password: url.password,
    ...searchParams,
  };
}
