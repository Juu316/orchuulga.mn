<script>
	import LegacyFrame from '$lib/LegacyFrame.svelte';
	let { data } = $props();
</script>

<LegacyFrame src={data.src} title={data.title} />
