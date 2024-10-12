import lodash from 'lodash';
import { PROTOCOL } from '../utils/constant.mjs';

const KEYS_CLASH = {
  name: 'name',
  type: 'type', // vmess、ss、ssr、trojan
  server: 'server',
  port: 'port',
  password: 'password',
  cipher: 'cipher', // auto  aes-128-gcm   chacha20-poly1305  none
  alterId: 'alterId', // 0
  uuid: 'uuid',
  udp: 'udp',
  tls: 'tls', // "tls"、"none"
  network: 'network', // ws http h2 grpc
  'interface-name': 'interface-name',
  'routing-mark': 'routing-mark',

  // ws-opts
  'ws-opts.path': 'ws-opts.path',
  'ws-opts.max-early-data': 'ws-opts.max-early-data',
  'ws-opts.early-data-header-name': 'ws-opts.early-data-header-name',
  'ws-opts.headers.Host': 'ws-opts.headers.Host',

  // http-opts
  'http-opts.method': 'ws-opts.method', // GET
  'http-opts.path': 'ws-opts.path',
  'http-opts.headers.Connection': 'http-opts.headers.Connection', // keep-alive

  // h2-opts
  'h2-opts.host': 'h2-opts.host',
  'h2-opts.path': 'h2-opts.path',

  // grpc-opts
  'grpc-opts.grpc-service-name': 'grpc-opts.grpc-service-name',

  // servername
  sni: 'sni', // alias servername
  servername: 'servername',
  'skip-cert-verify': 'skip-cert-verify',

  // 用于 ssr
  obfs: 'obfs',
  'obfs-param': 'obfs-param',
  protocol: 'protocol',
  'protocol-param': 'protocol-param',
};

// type vmess
const KEYS_VMESS = {
  ps: 'ps',
  add: 'add',
  port: 'port',
  id: 'id',
  aid: 'aid',
  net: 'net',
  tls: 'tls',
  path: 'path',
  host: 'host',
};

// type ss
const KEYS_SS = {
  name: 'name',
  server: 'server',
  port: 'port',
  cipher: 'cipher',
  password: 'password',
  type: 'type',
};

// TODO type ssr
const KEYS_SSR = {
  name: 'name',
  server: 'server',
  port: 'port',
  cipher: 'cipher',
  password: 'password',
  type: 'type',

  obfs: 'obfs',
  obfsparam: 'obfsparam',
  protocol: 'protocol',
  protoparam: 'protoparam',
};

// type trojan
const KEYS_TROJAN = {
  name: 'name',
  server: 'server',
  port: 'port',
  cipher: 'cipher',
  password: 'password',
  type: 'type',

  udp: 'udp',
  sni: 'sni',
  alpn: 'alpn',
  'skip-cert-verify': 'skip-cert-verify',
};

export const RULES_VMESS_CLASH = [
  [KEYS_CLASH.name, KEYS_VMESS.ps],
  [KEYS_CLASH.server, KEYS_VMESS.add],
  [KEYS_CLASH.port, KEYS_VMESS.port],
  [KEYS_CLASH.uuid, KEYS_VMESS.id],
  [KEYS_CLASH.alterId, KEYS_VMESS.aid],
  [KEYS_CLASH.network, KEYS_VMESS.net],
  [KEYS_CLASH['ws-opts.path'], KEYS_VMESS.path],
  [KEYS_CLASH['ws-opts.headers.Host'], KEYS_VMESS.host],

  [KEYS_CLASH.type, null, PROTOCOL.vmess],
  [KEYS_CLASH.cipher, null, 'auto'],
  [KEYS_CLASH.udp, null, true],
  [KEYS_CLASH.tls, null, (vmessBean) => vmessBean.tls === 'tls'],
];

export const RULES_SS_CLASH = [
  [KEYS_CLASH.name, KEYS_SS.name],
  [KEYS_CLASH.server, KEYS_SS.server],
  [KEYS_CLASH.port, KEYS_SS.port],
  [KEYS_CLASH.cipher, KEYS_SS.cipher],
  [KEYS_CLASH.password, KEYS_SS.password],
  [KEYS_CLASH.network, KEYS_SS.type],

  [KEYS_CLASH.type, null, PROTOCOL.ss],
  [KEYS_CLASH.udp, null, true],
];

export const RULES_SSR_CLASH = [
  [KEYS_CLASH.name, KEYS_SSR.name],
  [KEYS_CLASH.server, KEYS_SSR.server],
  [KEYS_CLASH.port, KEYS_SSR.port],
  [KEYS_CLASH.cipher, KEYS_SSR.cipher],
  [KEYS_CLASH.password, KEYS_SSR.password],
  [KEYS_CLASH.network, KEYS_SSR.type],

  [KEYS_CLASH.type, null, PROTOCOL.ssr],
  [KEYS_CLASH.udp, null, true],
];

export const RULES_TROJAN_CLASH = [
  [KEYS_CLASH.name, KEYS_TROJAN.name],
  [KEYS_CLASH.server, KEYS_TROJAN.server],
  [KEYS_CLASH.port, KEYS_TROJAN.port],
  [KEYS_CLASH.cipher, KEYS_TROJAN.cipher],
  [KEYS_CLASH.password, KEYS_TROJAN.password],
  [KEYS_CLASH.network, KEYS_TROJAN.type],

  [KEYS_CLASH.sni, KEYS_TROJAN.sni],
  [KEYS_CLASH.alpn, KEYS_TROJAN.alpn],

  [KEYS_CLASH.type, null, PROTOCOL.trojan],
  [KEYS_CLASH.udp, null, true],
];

const RULES = {
  [PROTOCOL.ss]: RULES_SS_CLASH,
  [PROTOCOL.ssr]: RULES_SSR_CLASH,
  [PROTOCOL.vmess]: RULES_VMESS_CLASH,
  [PROTOCOL.trojan]: RULES_TROJAN_CLASH,
};

export function convertToClashProxy(proxy, protocol) {
  const clashProxy = {};
  const rules = RULES[protocol];

  for (const rule of rules) {
    const [clashKey, key, valOrFn] = rule;

    // key, valOrFn 至少一个有值
    const valid = clashKey && (key || !lodash.isNil(valOrFn));
    if (!valid) continue;

    let fn = valOrFn;
    if (lodash.isNil(fn)) fn = lodash.get;
    else if (!lodash.isFunction(fn)) fn = () => valOrFn;

    const value = fn(proxy, key);
    if (!lodash.isNil(value)) lodash.set(clashProxy, clashKey, value);
  }

  return clashProxy;
}
