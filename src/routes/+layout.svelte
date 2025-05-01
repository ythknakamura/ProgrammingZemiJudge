<script lang="ts">
	import '../app.css';
	import {page} from '$app/state';
	import {currentStudent} from '$lib/state.svelte';
	import Icon from "@iconify/svelte";
	const {children} = $props();
</script>

<svelte:head>
	<title>縣陵プログラミング講座2025</title>
</svelte:head>

<div class="bg-container text-onContainer py-2 px-8 gap-8
	items-center grid grid-cols-[1fr_auto_auto] grid-flow-cols">
	<div class="text-lg">縣陵プログラミング講座2025</div>
	<nav class="flex flex-row gap-4">
		{#if page.url.pathname !== "/"}
			<a href="/">
				<Icon icon="mdi:home" class="text-3xl hover:opacity-80"/>
			</a>
		{/if}
		{#if page.url.pathname !== "/dashboard" && currentStudent.uid!==""}
			<a href="/dashboard">
				<Icon icon="mdi:list-box" class="text-3xl hover:opacity-80"/>
			</a>
		{/if}
	</nav>
	<p>{currentStudent.displayName}</p>
</div>

<div class="px-8 py-2">
	{@render children()}
</div>