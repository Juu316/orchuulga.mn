import { loadExportFromCurrentDir } from '$lib/server/exportHtmlPage.js';

export function load(event) {
	return loadExportFromCurrentDir(event, import.meta.url);
}
