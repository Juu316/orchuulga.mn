<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="facebook-domain-verification" content="49ot0otpppvhc9r39ca4f8fq8ihveh" />
</svelte:head>

{@render children()}
