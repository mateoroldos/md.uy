<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import GitHubStars from '$lib/components/GitHubStars.svelte';
	import OnlineStatus from '$lib/components/OnlineStatus.svelte';
	import PWAStatus from '$lib/components/PWAStatus.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { pwaInfo } from 'virtual:pwa-info';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { generateId, isValidId } from '$lib/utils';
	import { ArrowRight, Plus, Upload, Pin, Calendar } from '@lucide/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { NANOID_LENGTH } from '$lib/constants';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const { notes } = data;

	let documentId = $state('');
	let fileInput: HTMLInputElement;

	const webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	const pinnedNotes = $derived($notes && $notes.filter((note) => note.isPinned));

	function createNewDocument() {
		goto(`/${generateId()}`);
	}

	function joinDocument() {
		if (isValidId(documentId.trim())) goto(`/${documentId}`);
	}

	function createTodayNote() {
		const today = new Date();
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		const day = today.getDate();
		const month = months[today.getMonth()];
		const year = today.getFullYear();
		const content = `# ${day} of ${month}, ${year}`;

		const newDocId = generateId();
		sessionStorage.setItem(`import-${newDocId}`, content);
		goto(`/${newDocId}`);
	}

	async function handleFileImport(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (!file.name.toLowerCase().endsWith('.md')) {
			alert('Please select a valid markdown (.md) file');
			return;
		}

		try {
			const content = await file.text();
			const newDocId = generateId();

			sessionStorage.setItem(`import-${newDocId}`, content);

			goto(`/${newDocId}`);
		} catch (error) {
			console.error('Error reading file:', error);
			alert('Error reading the file. Please try again.');
		}
	}
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifest}
</svelte:head>

<ModeWatcher />
<div class="flex w-full flex-col">
	<div
		class="mx-auto grid w-[90%] flex-1 grid-cols-2 grid-rows-[auto_auto_1fr] flex-col gap-x-6 gap-y-1 overflow-hidden md:w-full md:grid-cols-[1fr_min(55%,_800px)_1fr] md:grid-rows-[auto_1fr_auto]"
	>
		<div class="flex items-center justify-start py-2 text-xs md:px-3">
			<a href="/" class="text-foreground/70">md.uy</a>
			{#if page.params.id}
				<span class="text-foreground/30 ml-1">/</span>
				<span class="ml-1 pt-[2px] font-mono">{`${page.params.id}`}</span>
			{/if}
		</div>
		{@render children()}
		<div class="row-start-2 flex flex-col px-3 py-2">
			<div class="mb-4">
				<Button
					variant="outline"
					size="sm"
					class="flex items-center gap-1 text-xs"
					onclick={createTodayNote}
				>
					<Calendar class="size-3!" />
					<span>Today's Note</span>
				</Button>
			</div>
			{#if pinnedNotes && pinnedNotes.length > 0}
				<h3 class="mb-2 flex items-center gap-1 text-xs font-medium">
					<Pin class="size-3" /> Pinned Notes
				</h3>
				<ul class="space-y-1 text-xs">
					{#each pinnedNotes as note (note.id)}
						<li>
							<a
								href="/{note.id}"
								class="hover:text-foreground text-foreground/70 block truncate transition-colors duration-100"
								title={note.title}
							>
								{note.title || 'Untitled Note'}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div
			class="col-start-2 row-start-1 flex items-center justify-end gap-2 py-2 md:col-start-3 md:px-3"
		>
			<GitHubStars />
			<ThemeToggle />
			<div class="relative ml-1">
				<Input
					class="h-7 w-32 pr-9 font-mono text-xs md:text-xs"
					bind:value={documentId}
					placeholder="document id"
					type="text"
					autocomplete="off"
					maxlength={NANOID_LENGTH}
				/>
				<Button
					class="absolute top-1/2 right-1 size-5 -translate-y-1/2"
					onclick={joinDocument}
					disabled={!isValidId(documentId)}
					variant="ghost"
					size="icon"
				>
					<ArrowRight class="size-3!" />
				</Button>
			</div>
			<input
				type="file"
				accept=".md"
				class="hidden"
				bind:this={fileInput}
				onchange={handleFileImport}
			/>
			<Button size="icon" variant="outline" onclick={() => fileInput.click()}>
				<Upload class="size-3!" />
			</Button>
			<Button size="icon" onclick={createNewDocument}><Plus class="size-3!" /></Button>
		</div>
	</div>
	<footer
		class="text-foreground/50 border-t-border/40! mt-2 flex items-center justify-between gap-2 border-t px-3 pt-1.5 pb-2 font-mono text-[0.7rem] leading-[0.7] tracking-tight"
	>
		<div class="flex items-center gap-2">
			<a href="/about" class="hover:text-foreground duration-100">about</a>
			<span>•</span>
			<a href="https://mr19.xyz" target="_blank" class="hover:text-foreground duration-100"
				>mr19.xyz</a
			>
			<span>•</span>
			<a
				href="https://github.com/mateoroldos/md.uy"
				target="_blank"
				class="hover:text-foreground duration-100">github</a
			>
		</div>
		<span class="text-foreground/50 text-[0.7rem]"
			>md.uy is in an experimental state, please download important notes.</span
		>
		<div class="flex items-center gap-5">
			<OnlineStatus />
			<PWAStatus />
		</div>
	</footer>
</div>
