import { serve_clite } from '@clite/serve'
import clite_meta from './.clite/.meta.ts'

Deno.serve({ port: 8080 },
	req => {
		if (req.method !== 'GET' && req.method !== 'HEAD')
			return new Response('clite: Method Not Allowed', { status: 405 })

		const url = new URL(req.url)
		const filename = url.pathname.slice(7) // '/static/***'
		return serve_clite(clite_meta, filename, req.method === 'HEAD')
	}
)
