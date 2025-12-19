import { parseArgs } from '@std/cli'
import { join } from '@std/path'
import { copy } from '@std/fs'
import { build } from 'esbuild'
import { denoPlugin } from '@deno/esbuild-plugin'
import { file_loader, exists, read_git } from './util.ts'

// 解析命令行参数
const args = parseArgs(Deno.args, {
	alias: {
		i: 'input',
		o: 'output',
		p: 'prefix',
		a: 'asset',
	},
	string: [
		'input',
		'output',
		'prefix',
		'asset',
	],
	default: {
		input: 'mod.ts',
		output: '.out',
		prefix: '/',
		asset: 'asset',
	},
})

// compile
const result = await build({
	entryPoints: [args.input], // 高贵的简单应用
	outdir: args.output,
	publicPath: args.prefix, // https://esbuild.github.io/api/#public-path
	format: 'esm',
	bundle: true,
	write: false,
	entryNames: '[name]-[hash]',
	treeShaking: true,
	minify: false,
	loader: file_loader,
	plugins: [denoPlugin()],
})

// 打印编译日志
if (result.warnings.length) {
	console.warn('\nesbuild warnings:')
	console.warn(result.warnings)
}
if (result.errors.length) {
	console.error('\nesbuild errors:')
	console.error(result.errors)
}

// 如果有老文件，就删除
if (await exists(args.output))
	await Deno.remove(args.output, { recursive: true })
// 创建新文件夹
await Deno.mkdir(args.output, { recursive: true })
// 写入 clite meta
await write_manifest()
// 复制 asset 文件
if (await exists(args.asset))
	await copy(args.asset, join(args.output, args.asset), {
		overwrite: true,
		preserveTimestamps: false,
	})
// 写入 compiled 文件
await Promise.all(
	result.outputFiles.map(
		file => Deno.writeFile(file.path, file.contents)
	)
)

async function write_manifest() {
	let js: string | null = null
	let css: string | null = null
	for (const file of result.outputFiles) {
		if (file.path.endsWith('.js')) {
			if (js === null)
				js = file.path.split('/').pop()!
			else
				throw Error('multiple js files found')
		} else if (file.path.endsWith('.css')) {
			if (css === null)
				css = file.path.split('/').pop()!
			else
				throw Error('multiple css files found')
		}
	}
	if (js === null) {
		console.error({ js })
		throw Error('no js file')
	}
	if (css === null)
		console.warn('no css file')
	Deno.writeTextFileSync(
		join(args.output, '.meta.ts'),
`export default {
	git_describe: '${await read_git()}',
	last_compiled: new Date(${Date.now()}),

	js: '${js}',
	css: ${css === null ? 'null' : `'${css}'`},

 	/** meta.outdir + meta.js = 本地文件路径（绝对路径） */
	outdir: import.meta.dirname!,
 	/** 域名 + meta.url_prefix + meta.js = http 访问路径（绝对路径） */
	url_prefix: '${args.prefix}',

	asset_prefix: ${args.asset
		? `'${join(args.prefix, args.asset)}'` // 在这里拼接好，serve 时就不用依赖 @std/path 了
		: null
	},
}`
	)
}
