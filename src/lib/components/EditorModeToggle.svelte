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
		variant={viewMode !== 'edit' ? 'ghost' : 'secondary'}
		size="sm"
		onclick={() => toggleEditorMode('edit')}
		shortcut={KEYMAP['EDIT_MODE']}
	>
		Edit
		<KeyboardShortcut shortcut={KEYMAP['EDIT_MODE']} />
	</Button>
	<Button
		variant={viewMode !== 'preview' ? 'ghost' : 'secondary'}
		size="sm"
		onclick={() => toggleEditorMode('preview')}
		shortcut={KEYMAP['PREVIEW_MODE']}
	>
		Preview
		<KeyboardShortcut shortcut={KEYMAP['PREVIEW_MODE']} />
	</Button>
</div>
