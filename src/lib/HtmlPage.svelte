<script>
	import { browser } from '$app/environment';

	let { page } = $props();

	let root = $state(/** @type {HTMLDivElement | null} */ (null));

	function fixFooterLinks(/** @type {HTMLElement} */ container) {
		for (const a of container.querySelectorAll('#colophon a[href]')) {
			const h = a.getAttribute('href');
			if (!h || h.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(h)) continue;
			if (h.startsWith('//')) continue;
			a.target = '_top';
		}
	}

	function injectScripts(/** @type {HTMLDivElement} */ el, scripts) {
		for (const old of el.querySelectorAll('script[data-export-injected]')) {
			old.remove();
		}
		for (const s of scripts) {
			const node = document.createElement('script');
			node.setAttribute('data-export-injected', '');
			if (s.src) {
				node.src = s.src;
			} else {
				node.textContent = s.inner;
			}
			const idM = s.attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
			if (idM) node.id = idM[1];
			const typeM = s.attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
			if (typeM) node.type = typeM[1];
			if (/\basync\b/i.test(s.attrs)) node.async = true;
			if (/\bdefer\b/i.test(s.attrs)) node.defer = true;
			el.appendChild(node);
		}
		fixFooterLinks(el);
	}

	$effect(() => {
		if (!browser || !root || !page?.scripts) return;
		injectScripts(root, page.scripts);
	});
</script>

<svelte:head>
	{#if page?.meta?.title}
		<title>{page.meta.title}</title>
	{/if}
	{#if page?.meta?.canonicalUrl}
		<link rel="canonical" href={page.meta.canonicalUrl} />
		<meta property="og:url" content={page.meta.canonicalUrl} />
	{/if}
	{#if page?.headHtml}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static export -->
		{@html page.headHtml}
	{/if}
</svelte:head>

<div bind:this={root} class="export-root {page?.bodyClass ?? ''}" role="document">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static export HTML -->
	{@html page?.bodyHtml ?? ''}
</div>

<style>
	.export-root {
		min-height: 100vh;
		min-height: 100dvh;
		background: #fff;
	}
</style>
