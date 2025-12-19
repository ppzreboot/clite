import { serve_clite } from '@clite/serve'
import clite_meta from './.clite/.meta.ts'

console.log(clite_meta.git_describe, clite_meta.last_compiled)

Deno.serve({ port: 20001 },
	req => {
		const url = new URL(req.url)

		if (req.method !== 'GET' && req.method !== 'HEAD') {
			console.log('invalid request')
			return new Response('clite: Method Not Allowed', { status: 405 })
		}

		if (req.method === 'GET' && url.pathname === '/') {
			console.log('loading html')
			return new Response(html, {
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
					'Cache-Control': 'private, max-age=0, must-revalidate',
				}
			})
		}

		console.log('loading clite', req.method, req.url)
		const filename = url.pathname.slice(clite_meta.url_prefix.length)
		return serve_clite(clite_meta, filename, req.method === 'HEAD')
	}
)

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>clite demo</title>
	<link rel="stylesheet" href="${clite_meta.url_prefix}/${clite_meta.css}">
	<script src="${clite_meta.url_prefix}/${clite_meta.js}"></script>
</head>
<body>
	<h1>Hello, World!</h1>
</body>
</html>
`
