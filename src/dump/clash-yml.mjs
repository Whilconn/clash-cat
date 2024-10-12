import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { ENCODING, PATHS } from '../utils/constant.mjs';

const distDir = PATHS.distAbs;
const templateDir = path.resolve(PATHS.srcAbs, 'template');

export async function dumpProxiesYml(proxies, distPath) {
  const ymlText = yaml.dump({ proxies });
  if (!distPath) distPath = path.resolve(distDir, 'proxies-alive.yml');
  return fsp.writeFile(distPath, ymlText, ENCODING.UTF8);
}

async function copyFiles() {
  const templatePaths = ['clash-config.yml'];
  const tasks = templatePaths.map((p) => {
    const srcPath = path.resolve(templateDir, p);
    const distPath = path.resolve(distDir, p);
    return fsp.cp(srcPath, distPath);
  });

  return Promise.all(tasks);
}

export async function dumpClashYml(proxies) {
  await dumpProxiesYml(proxies);
  await copyFiles();
}
