<script>
	import HtmlPage from '$lib/HtmlPage.svelte';

	let { data } = $props();
</script>

<HtmlPage page={data.page} />
