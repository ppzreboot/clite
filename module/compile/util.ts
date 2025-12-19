import type { Loader } from 'esbuild'

export
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

export
async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path)
    return true
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return false
    throw err
  }
}

export
const file_loader: Record<string, Loader> = {
	'.png': 'file',
	'.jpg': 'file',
	'.jpeg': 'file',
	'.gif': 'file',
	'.webp': 'file',
	'.avif': 'file',
	'.svg': 'file',
	'.bmp': 'file',
	'.ico': 'file',

	'.woff': 'file',
	'.woff2': 'file',
	'.ttf': 'file',
	'.otf': 'file',
	'.eot': 'file',
}
