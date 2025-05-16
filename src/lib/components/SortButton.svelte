<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		variant = 'ghost',
		size = 'icon',
		children,
		...restProps
	}: ComponentProps<typeof Button> = $props();
</script>

<div class="flex flex-row items-center gap-2">
	<span>{children}</span>
	<Button {variant} {size} {...restProps}>
		<ArrowUpDown class="size-3!" />
	</Button>
</div>
