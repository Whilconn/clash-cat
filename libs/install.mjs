import path from 'node:path';
import fsp from 'node:fs/promises';
import { LIBS } from './libs.mjs';
import { exec } from '../src/utils/exec.mjs';
import { PATHS } from '../src/utils/constant.mjs';

const pkgsDir = path.resolve(PATHS.libsAbs, 'pkgs');

function download(lib) {
  const { appPath, downloadUrl, zipName, unzipCmd } = lib;
  const execOpts = { cwd: pkgsDir };

  exec(`curl -sL -o ${zipName} ${downloadUrl}`, execOpts);

  exec(`${unzipCmd} ${zipName} && rm -rf ${zipName}`, execOpts);

  exec(`chmod +x ${appPath}`, execOpts);
}

async function start() {
  await fsp.rm(pkgsDir, { force: true, recursive: true });
  await fsp.mkdir(pkgsDir, { recursive: true });

  for (const lib of LIBS) download(lib);
}

start().then();
