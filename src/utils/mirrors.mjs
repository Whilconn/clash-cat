import ping from 'ping';

const ghMirrors = ['bgithub.xyz', 'github.ink', 'hgithub.xyz'];
const ghRawMirrors = ghMirrors.map((m) => `raw.${m}`);

const mirrorConfigList = [
  { host: 'github.com', mirrorHosts: ghMirrors },
  { host: 'raw.githubusercontent.com', mirrorHosts: ghRawMirrors },
];

let mirrorMapCache = {};
let mirrorCacheTime = 0;

async function checkMirrors() {
  if (Date.now() - mirrorCacheTime > 3 * 60 * 1000) {
    const hosts = mirrorConfigList.map((m) => m.mirrorHosts).flat();
    const pingTasks = hosts.map((h) => {
      return ping.promise.probe(h, { timeout: 2, min_reply: 1 });
    });

    const pingResults = await Promise.all(pingTasks);
    const pingMap = Object.fromEntries(hosts.map((h, i) => [h, pingResults[i].alive]));

    mirrorCacheTime = Date.now();
    mirrorMapCache = Object.fromEntries(
      mirrorConfigList.map((m) => {
        const aliveMirror = m.mirrorHosts.find((h) => pingMap[h]);
        return [m.host, aliveMirror];
      }),
    );
  }

  return mirrorMapCache;
}

export async function transformUrlByMirror(url) {
  const mirrorMap = await checkMirrors();

  const urlBean = new URL(url);
  const mirrorHost = mirrorMap[urlBean.hostname];

  if (mirrorHost) {
    urlBean.hostname = mirrorHost;
  }

  return urlBean.toString();
}

/** 示例
(async () => {
  const map = await checkMirrors();
  console.log(map);
})();
 */
