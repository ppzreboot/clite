import { parseArgs } from '@std/cli'
import { build } from 'esbuild'
import { denoPlugin } from '@deno/esbuild-plugin'
import { file_loader } from "./file-loader.ts";

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
	loader: file_loader,
	plugins: [denoPlugin()],
})

if (result.warnings.length) {
	console.warn('\nesbuild warnings:')
	console.warn(result.warnings)
}
if (result.errors.length) {
	console.error('\nesbuild errors:')
	console.error(result.errors)
}

if (await exists(args.output))
	await Deno.remove(args.output, { recursive: true })
await Deno.mkdir(args.output, { recursive: true })
await write_manifest()
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
	Deno.writeTextFileSync(args.output + '/.meta.ts',
`export default {
	outdir: import.meta.dirname!,
	js: '${js}',
	css: ${css === null ? 'null' : `'${css}'`},
	git_describe: '${await read_git()}',
	last_modified: new Date(${Date.now()}),
}`)
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

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path)
    return true
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return false
    throw err
  }
}
