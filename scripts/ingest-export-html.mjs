// One-time migration: read static/legacy page HTML, rewrite paths, move wp assets, remove legacy tree.
import {
	existsSync,
	readdirSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const legacyRoot = join(cwd, 'static', 'legacy');
const routesRoot = join(cwd, 'src', 'routes');
const staticRoot = join(cwd, 'static');

const SKIP_DIRS = new Set(['wp-content', 'wp-includes', 'wp-json']);

/**
 * @param {string} html
 */
function rewritePaths(html) {
	let s = html
		.replaceAll('/legacy/wp-content/', '/wp-content/')
		.replaceAll('/legacy/wp-includes/', '/wp-includes/')
		.replaceAll('"/legacy/wp-json', '"/wp-json')
		.replaceAll("'/legacy/wp-json", "'/wp-json");
	s = s.replace(/([,\s])wp-content\//g, '$1/wp-content/');
	s = s.replace(/([,\s])wp-includes\//g, '$1/wp-includes/');
	s = s.replace(/\/\/+wp-content\//g, '/wp-content/');
	s = s.replace(/\/\/+wp-includes\//g, '/wp-includes/');
	return s;
}

/**
 * @param {string} dir
 * @param {string[]} segments
 */
function collectPageDirs(dir, segments) {
	/** @type {{ segments: string[], filePath: string }[]} */
	const out = [];
	const indexPath = join(dir, 'index.html');
	if (existsSync(indexPath) && statSync(indexPath).isFile() && segments.length > 0) {
		out.push({ segments: [...segments], filePath: indexPath });
	}
	for (const ent of readdirSync(dir, { withFileTypes: true })) {
		if (!ent.isDirectory() || SKIP_DIRS.has(ent.name)) continue;
		out.push(...collectPageDirs(join(dir, ent.name), [...segments, ent.name]));
	}
	return out;
}

const RESERVED_TOP_DIRS = new Set([
	'+layout.server.js',
	'+layout.svelte',
	'+layout.js',
	'+page.svelte',
	'+page.server.js',
	'layout.css'
]);

function wipeRouteDirs() {
	for (const name of readdirSync(routesRoot)) {
		if (RESERVED_TOP_DIRS.has(name)) continue;
		const full = join(routesRoot, name);
		if (statSync(full).isDirectory()) {
			rmSync(full, { recursive: true, force: true });
		}
	}
}

if (!existsSync(legacyRoot)) {
	console.log('No static/legacy — skip ingest (already migrated).');
	process.exit(0);
}

const homePath = join(legacyRoot, 'index.html');
if (!existsSync(homePath)) {
	console.error('Missing static/legacy/index.html');
	process.exit(1);
}

const homeHtml = rewritePaths(readFileSync(homePath, 'utf8'));
const subpages = collectPageDirs(legacyRoot, []);
const subEntries = subpages.map(({ segments, filePath }) => ({
	segments,
	html: rewritePaths(readFileSync(filePath, 'utf8'))
}));

const wpContentFrom = join(legacyRoot, 'wp-content');
const wpContentTo = join(staticRoot, 'wp-content');
const wpIncludesFrom = join(legacyRoot, 'wp-includes');
const wpIncludesTo = join(staticRoot, 'wp-includes');

if (existsSync(wpContentFrom)) {
	if (existsSync(wpContentTo)) rmSync(wpContentTo, { recursive: true });
	renameSync(wpContentFrom, wpContentTo);
	console.log('Moved wp-content → static/wp-content');
}
if (existsSync(wpIncludesFrom)) {
	if (existsSync(wpIncludesTo)) rmSync(wpIncludesTo, { recursive: true });
	renameSync(wpIncludesFrom, wpIncludesTo);
	console.log('Moved wp-includes → static/wp-includes');
}

rmSync(legacyRoot, { recursive: true, force: true });
console.log('Removed static/legacy');

wipeRouteDirs();

const SVELTE_PAGE = `<script>
	import HtmlPage from '$lib/HtmlPage.svelte';

	let { data } = $props();
</script>

<HtmlPage page={data.page} />
`;

const SERVER_PAGE = `import { loadExportFromCurrentDir } from '$lib/server/exportHtmlPage.js';

export function load(event) {
	return loadExportFromCurrentDir(event, import.meta.url);
}
`;

writeFileSync(join(routesRoot, 'export.html'), homeHtml, 'utf8');
writeFileSync(join(routesRoot, '+page.svelte'), SVELTE_PAGE, 'utf8');
writeFileSync(join(routesRoot, '+page.server.js'), SERVER_PAGE, 'utf8');

for (const { segments, html } of subEntries) {
	const dir = join(routesRoot, ...segments);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'export.html'), html, 'utf8');
	writeFileSync(join(dir, '+page.svelte'), SVELTE_PAGE, 'utf8');
	writeFileSync(join(dir, '+page.server.js'), SERVER_PAGE, 'utf8');
}

console.log(`Ingested home + ${subEntries.length} routes into src/routes/`);
