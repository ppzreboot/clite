# @clite/compile

[Source Code](https://github.com/ppzreboot/clite/tree/main/module/compile)

``` bash
deno run -A jsr:@clite/compile --input=mod.ts --output=.out
```

`@clite/compile` 做两件事：
1. 编译前端文件（ts、js、css、图片、字体），输出文件的名字里带 hash（文件不变，hash 就不会变）
2. 每次编译会生成一个 meta 文件，记录输出文件的信息（js 和 css 入口、git 版本、编译时间等）

带 hash 的文件名允许[服务器设置永久缓存](https://github.com/ppzreboot/clite/tree/main/module/serve)（`Cache-Control: immutable`）。
而 meta 文件为这一操作提供必要信息（文件名、路径等）。

```
Options:
	-i, --input         输入文件 (default: "mod.ts")
	-o, --output        输出目录 (default: ".out")
	-p, --prefix        url 前缀 (default: "/")
	-a, --asset         不需编译、几乎不变的静态文件的目录 (default: "asset")

Examples:
	deno run -A jsr:@clite/compile -i=main.ts -o=../server/.clite -p=/static
	deno run -A jsr:@clite/compile # 全用默认值
```

#### 关于 `--prefix`

##### 1. 只用绝对路径

多页面应用，公共的资源，如 js、css、图片、字体，应该通过绝对路径访问。
否则 `/user` 页面，`/user/email` 页面，产生的相对路径很难处理。
clite 要求全部公共资源都只通过绝对路径访问。

##### 2. 编译后无法添加前缀

js 中 import 图片（或者 css 使用字体）,在**源代码阶段**可以是相对路径或绝对路径。
而编译器（esbuild）已经了生成绝对路径。
这些绝对路径**写在编译好的 js（或 css）文件中**，开发者不应修改编译的结果。

#### clite meta
除了 js、css 等文件，@clite/compile 还会生成一个 meta 文件。
像这种：

``` ts
// .meta.ts

export default {
	git_describe: 'bb16c2c-dirty',
	last_compiled: new Date(1766129521269),

	js: 'mod-5K2C2HLU.js',
	css: 'mod-ZOTHATSA.css',
	/** meta.outdir + meta.js = 本地文件路径（绝对路径） */
	outdir: import.meta.dirname!,
	/** 域名 + meta.url_prefix + meta.js = http 访问路径（绝对路径） */
	url_prefix: '/static',

	asset_prefix: '/static/asset',
}
```

#### clite doctrine

仅保留一个 entry。
如果你觉得一个 entry 不够用，那么说明你的 app 不简单。
