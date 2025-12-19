import { contentType } from '@std/media-types'

export
interface I_clite_meta {
	outdir: string
	js: string
	css: string
	git_describe: string
	last_compiled: Date
}

/** @param filename 安全处理过的静态文件名 */
export
async function serve_clite(
	meta: I_clite_meta,
	filename: string,
	is_head: boolean,
) {
	const path = `${meta.outdir}/${filename}`
	const valid = await valid_file(path)
	if (valid === 'file not exist')
		return new Response('clite: Not Found', { status: 404 })
	if (valid === 'target path is a directory')
		return new Response('clite: Forbidden', { status: 403 })

	const init: ResponseInit = {
		headers: {
			'Content-Type': contentType(filename) || 'application/octet-stream',
			'Cache-Control': 'public, max-age=31536000, immutable', // 全是带 hash 的文件，因此永久有效
			'ETag': '"' + filename + '"',
			/* meta.last_compiled 只是上次编译的时间，而多次编译时，某些文件可能并未改动
			   而文件的 stat.mtime 其实就是 last compiled（不会手动改） */
			'Last-Modified': 'Mon, 01 Jan 2025 00:00:00 GMT',
			// 'Content-Length': size.toString(), // 一般不需要
		}
	}
	if (is_head)
		return new Response(null, init)
	const file = await Deno.open(path, { read: true })
	return new Response(file.readable, init)
}

async function valid_file(path: string): Promise<true
	| 'target path is a directory'
	| 'file not exist'
> {
  try {
    const stat = await Deno.stat(path)
		if (stat.isFile)
			return true
		return 'target path is a directory'
  } catch (err) {
    if (err instanceof Deno.errors.NotFound)
			return 'file not exist'
    throw err
  }
}
