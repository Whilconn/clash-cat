import os from 'node:os';

const platform = os.type().toLowerCase();
const host = 'bgithub.xyz';

const V_LITE = 'v0.15.0';
export const LIB_LITE = {
  zipName: 'lite.gz',
  appPath: './lite',
  downloadUrl: `https://${host}/xxf098/LiteSpeedTest/releases/download/${V_LITE}/lite-${platform}-amd64-v3-${V_LITE}.gz`,
  unzipCmd: 'gzip -d',
};

const V_SUBCONVERTER = 'v0.9.0';
export const LIB_SUBCONVERTER = {
  zipName: 'subconverter.tar.gz',
  appPath: './subconverter/subconverter',
  downloadUrl: `https://${host}/tindy2013/subconverter/releases/download/${V_SUBCONVERTER}/subconverter_${platform}64.tar.gz`,
  unzipCmd: 'tar -zxf',
  generateIniPath: 'subconverter/generate.ini',
};

const V_MIHO = 'v1.19.20';
export const LIB_MIHOMO = {
  zipName: 'mihomo.gz',
  appPath: './mihomo',
  downloadUrl: `https://${host}/MetaCubeX/mihomo/releases/download/${V_MIHO}/mihomo-${platform}-amd64-${V_MIHO}.gz`,
  unzipCmd: 'gzip -d',
};

export const LIBS = [LIB_LITE, LIB_SUBCONVERTER, LIB_MIHOMO];
