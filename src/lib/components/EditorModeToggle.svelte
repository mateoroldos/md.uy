<script lang="ts">
	import type { EditorMode } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';

	let { viewMode = $bindable() } = $props<{
		viewMode: EditorMode;
	}>();

	function toggleEditorMode(mode: 'edit' | 'preview') {
		viewMode = mode;
	}
</script>

<div class="flex items-center justify-end gap-2" role="group">
	<Button
		variant="ghost"
		size="sm"
		onclick={() => toggleEditorMode('edit')}
		shortcut={KEYMAP['EDIT_MODE']}
	>
		<span class={viewMode !== 'edit' ? 'opacity-40' : ''}>Edit</span>
		<KeyboardShortcut shortcut={KEYMAP['EDIT_MODE']} />
	</Button>
	<Button
		variant="ghost"
		size="sm"
		onclick={() => toggleEditorMode('preview')}
		shortcut={KEYMAP['PREVIEW_MODE']}
	>
		<span class={viewMode !== 'preview' ? 'opacity-40' : ''}>Preview</span>
		<KeyboardShortcut shortcut={KEYMAP['PREVIEW_MODE']} />
	</Button>
</div>
