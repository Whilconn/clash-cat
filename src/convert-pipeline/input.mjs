import path from 'node:path';
import fsp from 'node:fs/promises';

import { PATHS } from '../utils/constant.mjs';

async function loadLocalFiles(dir) {
  const filePaths = await fsp.readdir(dir);
  return filePaths.map((f) => path.resolve(dir, f));
}

export async function loadSubFiles() {
  return loadLocalFiles(PATHS.subDistAbs);
}
