import type { Loader } from 'esbuild'

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
