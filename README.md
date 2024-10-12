# clash-cat

## 过滤节点

### filter_script

找到 libs/pkgs/subconverter/pref.toml 文件，注释 enable_filter 与 filter_script 配置，在该配置下方粘贴以下代码并按需修改。

```toml
enable_filter = true
filter_script = '''
function filter(node) {
    // return node.Port === 443;
    return node.Remark.includes('英国-3.63MB/s');
}
'''
```

!!! 注意：subconverter github 文档有错误

- filter 函数返回为true时丢弃该节点，返回为false时保留该节点

！！！注意：默认配置文件中的 filter 函数有错误

- JSON.parse(node.ProxyInfo).EncryptMethod 这样访问无效，直接访问 node.EncryptMethod 即可

参考文档：

- https://github.com/tindy2013/subconverter/blob/master/README-cn.md#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6
- https://github.com/netchx/netch/blob/268bdb7730999daf9f27b4a81cfed5c36366d1ce/GSF.md

### exclude_remarks

找到 libs/pkgs/subconverter/pref.toml 文件，找到 exclude_remarks 配置项，按需修改即可。

！！！注意其中的圆括号 `(` 等特殊符号需要转义，需要写成 `\\(`。
