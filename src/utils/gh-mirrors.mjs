const GH_HOST = 'raw.githubusercontent.com';
const JSDELIVR_HOST = 'cdn.jsdelivr.net';

export function convertGithubRawToJsdelivr(rawUrl) {
  // 去掉协议头（https://, http://, :// 或空串）
  const url = rawUrl.replace(/^(https?:)?\/\//, '');

  // 将URL按 '/' 拆分成数组
  const parts = url.split('/');

  // 检查 URL 是否符合 GitHub Raw 的格式
  if (parts.length < 5 || parts[0] !== GH_HOST) return rawUrl;

  // 提取各部分信息
  const [, username, repo, branch] = parts;
  // 重新组合文件路径
  const filePath = parts.slice(4).join('/');

  // 构造 Jsdelivr 的 CDN 链接
  return `https://${JSDELIVR_HOST}/gh/${username}/${repo}@${branch}/${filePath}`;
}

/** 使用示例
const originalUrl = 'https://raw.githubusercontent.com/vxiaov/free_proxies/main/clash/clash.provider.yaml';
const cdnUrl = convertGithubRawToJsdelivr(originalUrl);

console.log('CDN URL:', cdnUrl);
https://cdn.jsdelivr.net/gh/vxiaov/free_proxies@main/clash/clash.provider.yaml
 */

export function useGitHubMirror(originalUrl, mirrorIndex = 0) {
  const ghMirrors = ['bgithub.xyz', 'hgithub.xyz'];
  const ghRawMirrors = ghMirrors.map((m) => `raw.${m}`);

  const mirrorMap = {
    'github.com': ghMirrors,
    'raw.githubusercontent.com': ghRawMirrors,
  };

  const urlBean = new URL(originalUrl);
  const mirrorHosts = mirrorMap[urlBean.hostname];

  if (Array.isArray(mirrorHosts) && mirrorHosts?.length) {
    urlBean.hostname = mirrorHosts[mirrorIndex];
  }

  return urlBean.toString();
}

/** 使用示例
const originalUrl = 'https://raw.githubusercontent.com/vxiaov/free_proxies/main/clash/clash.provider.yaml';
const cdnUrl = useGitHubMirror(originalUrl);

console.log('MIRROR URL:', cdnUrl);
MIRROR URL: https://raw.bgithub.xyz/vxiaov/free_proxies/main/clash/clash.provider.yaml 
*/
