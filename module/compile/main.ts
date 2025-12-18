import { parseArgs } from '@std/cli'
import { build } from 'esbuild'

const args = parseArgs(Deno.args, {
	string: ['input', 'output'],
	default: {
		input: './mod.ts',
		output: './.out',
	},
})

const result = await build({
	entryPoints: [args.input], // 高贵的简单应用
	outdir: args.output,
	format: 'esm',
	bundle: true,
	write: false,
	entryNames: '[name]-[hash]',
	treeShaking: true,
	minify: false,
	loader: {
		'.png': 'file',
		'.webp': 'file',
		'.ttf': 'file',
	},
})

if (result.warnings.length) {
	console.warn('\nesbuild warnings:')
	console.warn(result.warnings)
}
if (result.errors.length) {
	console.error('\nesbuild errors:')
	console.error(result.errors)
}

await write_manifest()
Deno.mkdirSync(args.output, { recursive: true })
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
	if (js === null || css === null) {
		console.error({ js, css })
		throw Error('no js or css file')
	}
	Deno.writeTextFileSync(args.output + '/.clite.ts',
`export const js = '${js}'
export const css = '${css}'
export const git_describe = '${await read_git()}'
export const last_modified = new Date(${Date.now()})
`)
}

async function read_git() {
	// git describe --tags --dirty --always
	const cmd = new Deno.Command('git', {
		args: ['describe', '--tags', '--dirty', '--always'],
	})
	const result = await cmd.output()
	return new TextDecoder().decode(
		result.success
			? result.stdout
			: result.stderr
	).trim()
}
