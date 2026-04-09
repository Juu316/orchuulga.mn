import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { error } from '@sveltejs/kit';

function candidatesFor(slugParts) {
	const raw = slugParts.join('/');
	const dec = decodeURIComponent(raw);
	const variants = new Set([raw, dec, raw.normalize('NFC'), raw.normalize('NFD'), dec.normalize('NFC'), dec.normalize('NFD')]);
	return [...variants].filter(Boolean);
}

export function load({ params }) {
	const parts = (params.slug ?? '').split('/').filter(Boolean);
	if (!parts.length) throw error(404, 'Not found');

	for (const candidate of candidatesFor(parts)) {
		const local = join(process.cwd(), 'static', 'legacy', candidate, 'index.html');
		if (existsSync(local)) {
			return {
				src: `/legacy/${candidate}/index.html`,
				title: candidate
			};
		}
	}

	throw error(404, 'Not found');
}

