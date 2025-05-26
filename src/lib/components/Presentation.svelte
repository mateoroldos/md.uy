<script lang="ts">
	import { marked } from 'marked';
	import * as Y from 'yjs';
	import { Button } from '$lib/components/ui/button';
	import { onMount, onDestroy } from 'svelte';

	let { ytext, isVisible } = $props<{ ytext: Y.Text; isVisible: boolean }>();

	let currentSlide = $state(0);
	let slides = $state<string[]>([]);
	let isFullscreen = $state(false);
	let presentationElement: HTMLElement;

	const parseSlides = () => {
		const content = ytext.toString() as string;
		// Split by slide separator (---)
		const rawSlides = content.split(/^\s*---\s*$/m);

		slides = rawSlides.map(
			(slideContent) =>
				marked.parse(slideContent.trim(), {
					gfm: true,
					breaks: true
				}) as string
		);

		if (currentSlide >= slides.length) {
			currentSlide = Math.max(0, slides.length - 1);
		}
	};

	const prevSlide = () => {
		if (currentSlide > 0) {
			currentSlide--;
		}
	};

	const nextSlide = () => {
		if (currentSlide < slides.length - 1) {
			currentSlide++;
		}
	};

	const toggleFullscreen = () => {
		if (!isFullscreen) {
			if (presentationElement.requestFullscreen) {
				presentationElement.requestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (!isVisible) return;

		if (event.key === 'ArrowRight' || event.key === 'Space' || event.key === 'PageDown') {
			nextSlide();
			event.preventDefault();
		} else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
			prevSlide();
			event.preventDefault();
		} else if (event.key === 'Escape' && isFullscreen) {
			// Let the browser handle exiting fullscreen
		} else if (event.key === 'f' || event.key === 'F') {
			toggleFullscreen();
			event.preventDefault();
		}
	};

	const handleFullscreenChange = () => {
		isFullscreen = !!document.fullscreenElement;
	};

	onMount(() => {
		parseSlides();

		window.addEventListener('keydown', handleKeydown);
		document.addEventListener('fullscreenchange', handleFullscreenChange);

		ytext.observe(() => {
			parseSlides();
		});
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});
</script>

<div
	class="bg-card relative flex h-full w-full flex-col overflow-hidden rounded"
	class:hidden={!isVisible}
	bind:this={presentationElement}
>
	{#if slides.length === 0 && isVisible}
		<div class="text-foreground/40 absolute top-5.5 left-4 z-10 sm:left-11">
			No content to present yet. Add content with --- separators to create slides.
		</div>
	{:else if isVisible}
		<div class="flex flex-1 items-center justify-center overflow-hidden">
			<div
				class="slide-content prose dark:prose-invert mx-auto flex h-full w-full max-w-4xl items-center justify-center overflow-auto p-8"
				class:fullscreen={isFullscreen}
			>
				{#if slides[currentSlide]}
					<div class="flex h-full w-full flex-col items-center justify-center">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html slides[currentSlide]}
					</div>
				{:else}
					<div class="text-foreground/40">Empty slide</div>
				{/if}
			</div>
		</div>

		<div class="presentation-controls bg-card flex items-center justify-between border-t p-4">
			<div class="slide-counter text-foreground/70 text-sm">
				Slide {currentSlide + 1} of {slides.length}
			</div>

			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={prevSlide} disabled={currentSlide === 0}>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={nextSlide}
					disabled={currentSlide >= slides.length - 1}
				>
					Next
				</Button>
				<Button variant="outline" size="sm" onclick={toggleFullscreen}>
					{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
				</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.slide-content.fullscreen {
		font-size: 1.2em;
	}

	/* Ensure the presentation container takes full screen when in fullscreen mode */
	:global(:-webkit-full-screen) {
		width: 100%;
		height: 100%;
	}

	:global(:fullscreen) {
		width: 100%;
		height: 100%;
	}
</style>
