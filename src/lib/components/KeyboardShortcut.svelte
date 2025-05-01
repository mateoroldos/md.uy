<script lang="ts">
	import type { Shortcut } from '$lib/keymap/keymap';

	let { shortcut } = $props<{
		shortcut: Shortcut;
	}>();

	function getModifierSymbol(modifier: 'control' | 'alt' | 'shift'): string {
		const isMac = navigator.userAgent.toLowerCase().includes('mac');

		const modifierMap = {
			control: isMac ? '⌘' : 'Ctrl',
			alt: isMac ? '⌥' : 'Alt',
			shift: '⇧'
		};

		return modifierMap[modifier];
	}

	function getKeyFromCode(code: string): string {
		if (code.startsWith('Key')) {
			return code.slice(3);
		}
		return code;
	}

	let shortcutString = $state('');
	if (shortcut.control) shortcutString += getModifierSymbol('control');
	if (shortcut.alt) shortcutString += getModifierSymbol('alt');
	if (shortcut.shift) shortcutString += getModifierSymbol('shift');
	shortcutString += getKeyFromCode(shortcut.code);
</script>

<kbd class="text-muted-foreground font-mono text-[0.72rem] opacity-50">{shortcutString}</kbd>
