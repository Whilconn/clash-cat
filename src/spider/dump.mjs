import { randomBytes } from 'crypto';

function randomStr() {
  return randomBytes(5).toString('hex');
}

function dumpPlainText() {}

function dumpYml() {}

function dumpBase64() {}
