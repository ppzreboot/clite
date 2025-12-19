import { contentType } from '@std/media-types'

export
interface I_clite_meta {
	git_describe: string
	last_compiled: Date
	js: string
	css: string
	outdir: string
	url_prefix: string
	asset_prefix: string
}

/**
 * Serve 由 @clite/compile 生成的静态文件
 * @param abs_path 绝对路径
 * @param is_head 是否 HEAD 请求 (否则是 GET 请求)
 */
export
async function serve_clite(
	meta: I_clite_meta,
	url_path: string,
	is_head: boolean,
): Promise<Response> {
	const filename = url_path.slice(meta.url_prefix.length)
	const local_path = meta.outdir + filename
	const stat = await get_stat(local_path)
	if (stat === 'file not exist')
		return new Response('clite: Not Found', { status: 404 })
	if (!stat.isFile) // TODO: 未测试
		return new Response('clite: Forbidden', { status: 403 })

	return filename.startsWith(meta.asset_prefix)
		? await respond_asset(filename, local_path, is_head)
		: await respond_immutable(filename, local_path, is_head)
}

function get_content_type(filename: string) {
	return contentType('.' + filename.split('.').pop()!) || 'application/octet-stream'
}

async function respond_immutable(filename: string, local_path: string, is_head: boolean) {
	const init: ResponseInit = {
		headers: {
			'Content-Type': get_content_type(filename),
			'Cache-Control': 'public, max-age=31536000, immutable', // 全是带 hash 的文件，因此永久有效
			'ETag': `"${filename}"`, // 这个 filename 是带 hash 的
			/* meta.last_compiled 只是上次编译的时间，而多次编译时，某些文件可能并未改动
				而文件的 stat.mtime 其实就是 last compiled（不会手动改） */
			'Last-Modified': 'Mon, 01 Jan 2025 00:00:00 GMT',
			// 'Content-Length': size.toString(), // 一般不需要
		}
	}
	if (is_head)
		return new Response(null, init)
	const file = await Deno.open(local_path, { read: true })
	return new Response(file.readable, init)
}

async function respond_asset(filename: string, local_path: string, is_head: boolean) {
	const init: ResponseInit = {
		headers: {
			'Content-Type': get_content_type(filename),
			'Cache-Control': 'public, max-age=86400', // 1 天缓存
		}
	}
	if (is_head)
		return new Response(null, init)
	const file = await Deno.open(local_path, { read: true })
	return new Response(file.readable, init)
}

async function get_stat(local_path: string): Promise<'file not exist' | Deno.FileInfo> {
  try {
    return await Deno.stat(local_path)
  } catch (err) {
    if (err instanceof Deno.errors.NotFound)
			return 'file not exist'
    throw err
  }
}
