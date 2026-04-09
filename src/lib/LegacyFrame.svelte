<script>
	let { src, title } = $props();
</script>

<iframe {src} {title} loading="eager" class="legacy-frame"></iframe>

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
