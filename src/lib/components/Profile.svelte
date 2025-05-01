<script lang="ts">
	import type { ActiveUser } from '$lib/stores/active-user.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { activeUser = $bindable() } = $props<{ activeUser: ActiveUser }>();
</script>

<Dialog.Root>
	<Dialog.Trigger class={`${buttonVariants({ variant: 'outline', size: 'sm' })}`}>
		<div class="flex items-center gap-2">
			<div
				class="border-foreground h-3 w-3 rounded-full border"
				style:background-color={activeUser.activeUser.color}
			></div>
			<span>{activeUser.activeUser.name}</span>
		</div>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit profile</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-5 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input
					id="name"
					bind:value={activeUser.activeUser.name}
					placeholder="Enter your name"
					class="col-span-4"
				/>
			</div>
			<div class="grid grid-cols-5 items-center gap-4">
				<Label for="color" class="text-right">Color</Label>
				<div class="col-span-4 flex items-center gap-2">
					<input
						type="color"
						id="color"
						bind:value={activeUser.activeUser.color}
						class="h-8 w-8 cursor-pointer rounded"
					/>
					<span class="font-mono text-xs">{activeUser.activeUser.color}</span>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
