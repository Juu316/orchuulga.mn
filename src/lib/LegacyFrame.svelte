<script>
	let { src, title } = $props();

	/** Footer lives in an iframe; internal links must open in the top window, not inside the iframe. */
	function onFrameLoad(e) {
		const doc = e.currentTarget.contentDocument;
		if (!doc) return;

		for (const a of doc.querySelectorAll('#colophon a[href]')) {
			const h = a.getAttribute('href');
			if (!h || h.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(h)) continue;
			if (h.startsWith('//')) continue;
			a.target = '_top';
		}
	}
</script>

<iframe {src} {title} loading="eager" class="legacy-frame" onload={onFrameLoad}></iframe>

<style>
	.legacy-frame {
		width: 100%;
		height: 100vh;
		height: 100dvh;
		min-height: 100vh;
		border: 0;
		display: block;
		background: #fff;
	}
</style>
