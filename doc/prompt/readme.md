# clite 总体构思
我在做一个 clite 框架。
clite 就是 client lite。
它比较像“前后端分离时代之前”的那种 mvc 架构。

前后端分离是因为**有些**前端交互越来越复杂，
但如果开发者自己写个小玩意，那么有时候前端交互并不怎么复杂。
这时候这种复古的 clite 就派上用场了。

clite 的前端“程序”有两种：
+ html 由后端动态渲染
+ js/css/... 用 esbuild 打包

多个 js 文件可以合并成一个 js 文件，减少请求次数。
由于前提“小玩意、交互不复杂”的存在，最终的 js、css 文件不会很大。 
所以最终只有一个 js 文件，一个 css 文件（被每个 html 引用）。
文件名里有 esbuild 生成的 hash，避免缓存。
我打算把“除 html 之外的前端文件”的缓存设置为 `cache-control: immutable, public, max-age=31536000`。

## 编译期 manifest

不是 json，我的 manifest 是 ts，以便 deno 直接 import，大概是这样：
``` ts
export default {
	outdir: import.meta.dirname, // manifest 文件跟编译出来的文件在同一个目录
	js: 'mod-AIVDZZIX.js',
	css: 'mod-QBJQN4DW.css',
	git_describe: 'c8815e5-dirty',
	last_modified: new Date(1766109768457),
}
```

## 局部的复杂交互

但毕竟是“现代应用”，小部分交互可能比较复杂，
我打算用 hyperapp 来做“局部的复杂交互”。
