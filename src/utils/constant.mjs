import path from 'node:path';

const root = process.cwd();

export const PATHS = {
  rootAbs: root,
  srcAbs: path.resolve(root, 'src'),
  libsAbs: path.resolve(root, 'libs'),
  pkgsAbs: path.resolve(root, 'libs/pkgs'),
  localAbs: path.resolve(root, 'local'),
  distAbs: path.resolve(root, 'dist'),
  tmpDistAbs: path.resolve(root, 'dist/tmp'),
  subDistAbs: path.resolve(root, 'dist/sub'),
  logAbs: path.resolve(root, 'log'),
};

export const PROTOCOL = {
  ss: 'ss',
  ssr: 'ssr',
  vmess: 'vmess',
  trojan: 'trojan',
};

export const ENCODING = {
  UTF8: 'utf-8',
  BASE64: 'base64',
};

export const SUB_PREFIX = {
  PLAIN: 'PLAIN',
  BASE64: 'BASE64',
  YML: 'YML',
};
