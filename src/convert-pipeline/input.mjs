import path from 'node:path';
import fsp from 'node:fs/promises';

import { PATHS } from '../utils/constant.mjs';

async function loadLocalFiles() {
  const tempDir = path.resolve(PATHS.localAbs, new Date().toJSON().slice(0, 10));
  const filePaths = await fsp.readdir(tempDir);
  return filePaths.map((f) => path.resolve(tempDir, p));
}

async function downloadRemoteFiles(url) {
  await axios.get(url).then((res) => res.data);
}

export async function loadSubFiles() {
  await downloadRemoteFiles();
  return loadLocalFiles();
}
