<script>
	let { src, title } = $props();
</script>

<iframe {src} {title} loading="eager" class="legacy-frame"></iframe>

<style>
	/*
	 * Mobile Safari often collapses iframe height with vh/dvh alone. Anchor to the
	 * filled .sveltekit-body and use absolute edges so the frame always paints.
	 */
	.legacy-frame {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
		background: #fff;
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
	}
</style>
