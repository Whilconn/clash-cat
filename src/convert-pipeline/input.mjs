import path from 'node:path';
import fsp from 'node:fs/promises';

import { PATHS } from '../utils/constant.mjs';
import { exec } from '../utils/exec.mjs';

async function loadLocalFiles() {
  const tempDir = path.resolve(PATHS.localAbs, new Date().toJSON().slice(0, 10));
  const filePaths = await fsp.readdir(tempDir);
  return filePaths.map((f) => path.resolve(tempDir, f));
}

async function downloadRemoteFiles(url) {
  await exec(`curl -O ${url}`);
  await exec(`curl -O ${url}`);
}

export async function loadSubFiles() {
  // await downloadRemoteFiles('https://github.com/Whilconn/clash-cat/releases/download/v1/sub.zip');
  return loadLocalFiles();
}
