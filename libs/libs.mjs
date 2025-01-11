import os from 'node:os';

const platform = os.type().toLowerCase();
const host = 'bgithub.xyz';

export const LIB_LITE = {
  zipName: 'lite.gz',
  appPath: './lite',
  downloadUrl: `https://${host}/xxf098/LiteSpeedTest/releases/download/v0.15.0/lite-${platform}-amd64-v3-v0.15.0.gz`,
  unzipCmd: 'gzip -d',
};

export const LIB_SUBCONVERTER = {
  zipName: 'subconverter.tar.gz',
  appPath: './subconverter/subconverter',
  downloadUrl: `https://${host}/tindy2013/subconverter/releases/download/v0.9.0/subconverter_${platform}64.tar.gz`,
  unzipCmd: 'tar -zxf',
  generateIniPath: 'subconverter/generate.ini',
};

export const LIB_MIHOMO = {
  zipName: 'mihomo.gz',
  appPath: './mihomo',
  downloadUrl: `https://${host}/MetaCubeX/mihomo/releases/download/v1.19.1/mihomo-${platform}-amd64-v1.19.1.gz`,
  unzipCmd: 'gzip -d',
};

export const LIBS = [LIB_LITE, LIB_SUBCONVERTER, LIB_MIHOMO];
