# @clite/serve

[Source Code](https://github.com/ppzreboot/clite/tree/main/module/serve)

Serve 由 [@clite/compile](https://github.com/ppzreboot/clite/tree/main/module/compile) 生成的静态文件。

最佳实践：
静态文件服务器藏到 cdn 服务后面。
因为 Cache-Control 是 immutable，所以每个静态文件，只被访问一次。
