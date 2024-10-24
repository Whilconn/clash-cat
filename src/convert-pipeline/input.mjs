import path from 'node:path';
import fsp from 'node:fs/promises';

import { PATHS } from '../utils/constant.mjs';
import { exec } from '../utils/exec.mjs';

async function loadLocalFiles(dir) {
  const filePaths = await fsp.readdir(dir);
  return filePaths.map((f) => path.resolve(dir, f));
}

async function downloadRemoteFiles(url) {
  await exec(`curl -O ${url}`);
  await exec(`curl -O ${url}`);
}

export async function loadSubFiles() {
  // await downloadRemoteFiles('https://github.com/Whilconn/clash-cat/releases/download/v1/sub.zip');
  return loadLocalFiles(PATHS.subDistAbs);
}
