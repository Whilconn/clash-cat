type ProxyNode = {
  name: string;
  type: string;
  server: string;
  port: string;
  password: string;
  [key: string]: unknown;
};

type ResolvedSub =
  | { url: string; isBase64: boolean; base64Lines: string[] }
  | { url: string; isPlain: boolean; plainLines: string[] }
  | { url: string; isYml: boolean; ymlProxies: ProxyNode[] };
