<script>
	let { data } = $props();
</script>

<iframe src={data.src} title={data.title} loading="eager" class="legacy-frame"></iframe>

<style>
	.legacy-frame {
		width: 100%;
		min-height: calc(100vh - 8px);
		border: 0;
		display: block;
		background: #fff;
	}
</style>
