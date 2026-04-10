import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const origin = (process.env.ORCHUULGA_ORIGIN ?? 'https://www.orchuulga.mn').replace(/\/$/, '');
const routesRoot = join(process.cwd(), 'src', 'routes');

/**
 * @param {string} dir
 * @param {string[]} segments
 * @returns {string[]}
 */
function collect(dir, segments) {
	/** @type {string[]} */
	const out = [];
	const exportPath = join(dir, 'export.html');
	if (existsSync(exportPath) && statSync(exportPath).isFile()) {
		if (segments.length === 0) {
			out.push(origin + '/');
		} else {
			const path = segments.map((s) => encodeURIComponent(s)).join('/');
			out.push(`${origin}/${path}`);
		}
	}
	for (const name of readdirSync(dir, { withFileTypes: true })) {
		if (!name.isDirectory()) continue;
		if (name.name.startsWith('.')) continue;
		out.push(...collect(join(dir, name.name), [...segments, name.name]));
	}
	return out;
}

if (!existsSync(routesRoot)) {
	console.error('Missing src/routes');
	process.exit(1);
}

const urls = [...new Set(collect(routesRoot, []))].sort();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`;

writeFileSync(join(process.cwd(), 'static', 'sitemap.xml'), xml);
console.log(`Wrote sitemap with ${urls.length} URLs`);
