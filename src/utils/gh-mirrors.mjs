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

/** 示例使用
const originalUrl = 'https://raw.githubusercontent.com/vxiaov/free_proxies/main/clash/clash.provider.yaml';
const cdnUrl = convertGithubRawToJsdelivr(originalUrl);

console.log('CDN URL:', cdnUrl);
 */
