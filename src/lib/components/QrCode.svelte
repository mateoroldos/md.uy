<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import { parse, formatHex } from 'culori';

	interface Props {
		value: string;
		size?: number;
		errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
		className?: string;
	}

	let { value, size = 256, errorCorrectionLevel = 'M', className = '' }: Props = $props();

	let canvasElement: HTMLCanvasElement;
	let containerElement: HTMLDivElement;

	const generateQR = async (): Promise<void> => {
		if (!canvasElement || !value) return;

		const style = getComputedStyle(containerElement);
		const backgroundRaw = style.getPropertyValue('--background').trim();
		const foregroundRaw = style.getPropertyValue('--foreground').trim();

		const backgroundColor = formatHex(parse(backgroundRaw)) || '#ffffff';
		const foregroundColor = formatHex(parse(foregroundRaw)) || '#000000';

		try {
			await QRCode.toCanvas(canvasElement, value, {
				width: size,
				errorCorrectionLevel,
				color: {
					dark: foregroundColor,
					light: backgroundColor
				}
			});
		} catch (error) {
			console.error('Error generating QR code:', error);
		}
	};

	onMount(() => {
		generateQR();
	});

	$effect(() => {
		generateQR();
	});
</script>

<div bind:this={containerElement} class={cn('inline-block', className)}>
	<canvas bind:this={canvasElement}></canvas>
</div>
