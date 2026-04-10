import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { error } from '@sveltejs/kit';

/** @typedef {{ attrs: string, inner: string, src: string | null }} ExportScript */
/** @typedef {{ headHtml: string, bodyHtml: string, scripts: ExportScript[], bodyClass: string, meta: { title: string, description: string, canonicalUrl: string, canonicalPath: string } }} ParsedPage */

/**
 * @param {string} pathname
 */
function pathnameToParts(pathname) {
	const pathOnly = pathname.split('?')[0] ?? '';
	const clean = pathOnly.replace(/^\/+|\/+$/g, '');
	return clean ? clean.split('/').filter(Boolean) : [];
}

/**
 * @param {string} pathname
 */
export function canonicalPathFromPathname(pathname) {
	const parts = pathnameToParts(pathname);
	if (!parts.length) return '/';
	const encoded = parts.map((p) => {
		try {
			return encodeURIComponent(decodeURIComponent(p));
		} catch {
			return encodeURIComponent(p);
		}
	});
	return '/' + encoded.join('/');
}

/**
 * @param {string} html
 */
function decodeHtmlEntities(html) {
	if (!html) return '';
	return html
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

/**
 * @param {string} headHtml
 * @param {string} origin
 */
function absolutizeMetaUrls(headHtml, origin) {
	return headHtml.replace(
		/(<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|og:image:secure_url)["'][^>]*content=["'])(\/[^"']*)(["'])/gi,
		(_, a, path, c) => `${a}${origin}${path}${c}`
	);
}

/**
 * @param {string} headHtml
 */
function stripConflictingSeoTags(headHtml) {
	return headHtml
		.replace(/<link[^>]*\srel=["']canonical["'][^>]*>/gi, '')
		.replace(/<meta[^>]*\sproperty=["']og:url["'][^>]*>/gi, '');
}

/**
 * @param {string} bodyInner
 * @returns {{ html: string, scripts: ExportScript[] }}
 */
function extractExecutableScripts(bodyInner) {
	/** @type {ExportScript[]} */
	const scripts = [];
	const html = bodyInner.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi, (full, attrs = '', inner) => {
		const attrStr = attrs || '';
		const typeMatch = attrStr.match(/\btype\s*=\s*["']([^"']+)["']/i);
		const type = typeMatch ? typeMatch[1].toLowerCase().trim() : 'text/javascript';
		if (type === 'application/json' || type === 'application/ld+json') {
			return full;
		}
		const srcMatch = attrStr.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
		scripts.push({ attrs: attrStr.trim(), inner, src: srcMatch ? srcMatch[1] : null });
		return '';
	});
	return { html, scripts };
}

const DEFAULT_ORIGIN = 'https://orchuulga.mn';

function siteOrigin() {
	return (process.env.ORCHUULGA_ORIGIN ?? DEFAULT_ORIGIN).replace(/\/$/, '');
}

/**
 * @param {string} html
 * @param {string} pathname
 * @param {string} origin
 */
export function parseExportedHtml(html, pathname, origin) {
	const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
	const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);

	let headInner = headMatch?.[1] ?? '';
	const bodyAttrs = bodyMatch?.[1] ?? '';
	const bodyInner = bodyMatch?.[2] ?? '';

	headInner = headInner
		.replace(/<meta\s+charset\s*=\s*[^>]+>/gi, '')
		.replace(/<meta\s+name=["']viewport["'][^>]*>/gi, '')
		.replace(/<title>[\s\S]*?<\/title>/gi, '')
		.replace(/<base[^>]*>/gi, '');

	headInner = stripConflictingSeoTags(headInner);
	headInner = absolutizeMetaUrls(headInner, origin);

	const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
	const title = decodeHtmlEntities(titleMatch?.[1]?.trim() ?? 'orchuulga.mn');

	const descMatch = html.match(
		/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
	);
	const description = descMatch?.[1] ? decodeHtmlEntities(descMatch[1]) : '';

	const { html: bodyHtml, scripts } = extractExecutableScripts(bodyInner);

	const canonicalPath = canonicalPathFromPathname(pathname);
	const canonicalUrl = origin.replace(/\/$/, '') + canonicalPath;

	const bodyClassMatch = bodyAttrs.match(/\bclass\s*=\s*["']([^"']*)["']/i);
	const bodyClass = bodyClassMatch?.[1]?.trim() ?? '';

	return {
		headHtml: headInner,
		bodyHtml,
		scripts,
		bodyClass,
		meta: {
			title,
			description,
			canonicalUrl,
			canonicalPath
		}
	};
}

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {string} importMetaUrl
 */
export function loadExportFromCurrentDir(event, importMetaUrl) {
	const moduleDir = dirname(fileURLToPath(importMetaUrl));
	const routeId = event.route?.id ?? '';
	const routePartsFromId = routeId.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
	const routePartsFromPath = pathnameToParts(event.url.pathname).map((p) => {
		try {
			return decodeURIComponent(p);
		} catch {
			return p;
		}
	});
	const routeParts = routePartsFromId.length ? routePartsFromId : routePartsFromPath;

	/** @type {string[]} */
	const candidatePaths = [
		join(moduleDir, 'export.html'),
		join(process.cwd(), 'src', 'routes', ...routeParts, 'export.html')
	];

	const filePath = candidatePaths.find((p) => existsSync(p));
	if (!filePath) {
		throw error(404, 'Not found');
	}
	const raw = readFileSync(filePath, 'utf8');
	const page = parseExportedHtml(raw, event.url.pathname, siteOrigin());
	return { page };
}
