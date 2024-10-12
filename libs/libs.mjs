import os from 'node:os';

const platform = os.type().toLowerCase();

export const LIB_LITE = {
  zipName: 'lite.gz',
  appPath: './lite',
  downloadUrl: `https://bgithub.xyz/xxf098/LiteSpeedTest/releases/download/v0.15.0/lite-${platform}-amd64-v3-v0.15.0.gz`,
  unzipCmd: 'gzip -d',
};

export const LIB_SUBCONVERTER = {
  zipName: 'subconverter.tar.gz',
  appPath: './subconverter/subconverter',
  downloadUrl: `https://bgithub.xyz/tindy2013/subconverter/releases/download/v0.9.0/subconverter_${platform}64.tar.gz`,
  unzipCmd: 'tar -zxf',
  generateIniPath: 'subconverter/generate.ini',
};

export const LIBS = [LIB_LITE, LIB_SUBCONVERTER];
