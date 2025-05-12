import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const platform = event.platform as App.Platform;
	const cache = platform.caches.default;
	const cacheKey = new Request('https://api.github.com/repos/mateoroldos/md.uy');

	const response = await cache.match(cacheKey);
	if (response) {
		const cachedDate = response.headers.get('x-cached-at');
		const cacheAge = cachedDate ? Date.now() - new Date(cachedDate).getTime() : Infinity;

		if (cacheAge < 3600000) {
			// 1 hour
			return response;
		}
	}

	const fetchResponse = await fetch(cacheKey, {
		headers: {
			Accept: 'application/vnd.github+json',
			'User-Agent': 'md.uy-pwa'
		}
	});

	if (fetchResponse.ok) {
		const data = await fetchResponse.json();

		const newResponse = new Response(JSON.stringify(data), {
			headers: {
				'Content-Type': 'application/json',
				'x-cached-at': new Date().toISOString()
			}
		});

		platform.context.waitUntil(cache.put(cacheKey, newResponse.clone()));

		return newResponse;
	}

	return new Response('Error fetching GitHub stars', { status: 500 });
};
