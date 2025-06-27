<script lang="ts">
	import { columns } from './notes/columns';
	import {
		type ColumnFiltersState,
		type PaginationState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		getFilteredRowModel
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';
	import { Pin, Star } from '@lucide/svelte';
	import type { Readable } from 'svelte/store';
	import type { CachedNote } from '$lib/services/tinybase';

	let { notes } = $props<{ notes: Readable<CachedNote[]> }>();
	$inspect($notes);
	console.log($notes);

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return $notes;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			}
		}
	});
</script>

<div>
	<div class="flex justify-between gap-4 py-4">
		<!-- <Input -->
		<!-- 	placeholder="Filter titles..." -->
		<!-- 	value={table?.getColumn('title')?.getFilterValue() as string} -->
		<!-- 	onchange={(e) => table?.getColumn('title')?.setFilterValue(e.currentTarget.value)} -->
		<!-- 	oninput={(e) => table?.getColumn('title')?.setFilterValue(e.currentTarget.value)} -->
		<!-- 	class="h-8 max-w-sm text-xs! placeholder:text-xs" -->
		<!-- /> -->

		<div class="flex flex-1 flex-row justify-end gap-1 text-xs">
			<!-- <Button -->
			<!-- 	variant={table?.getColumn('isPinned')?.getFilterValue() ? 'default' : 'outline'} -->
			<!-- 	size="sm" -->
			<!-- 	class="aspect-square h-full" -->
			<!-- 	onclick={() => { -->
			<!-- 		const column = table?.getColumn('isPinned'); -->
			<!-- 		column?.setFilterValue(column?.getFilterValue() ? null : true); -->
			<!-- 	}} -->
			<!-- > -->
			<!-- 	<Pin class="size-3!" /> -->
			<!-- </Button> -->
			<!---->
			<!-- <Button -->
			<!-- 	variant={table?.getColumn('isFavorite')?.getFilterValue() ? 'default' : 'outline'} -->
			<!-- 	size="sm" -->
			<!-- 	class="aspect-square h-full" -->
			<!-- 	onclick={() => { -->
			<!-- 		const column = table?.getColumn('isFavorite'); -->
			<!-- 		column?.setFilterValue(column?.getFilterValue() ? null : true); -->
			<!-- 	}} -->
			<!-- > -->
			<!-- 	<Star class="size-3!" /> -->
			<!-- </Button> -->
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row class="bg-muted/30 text-xs">
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row
						data-state={row.getIsSelected() && 'selected'}
						onclick={() => goto(`/${row.original.filename}`)}
						class="cursor-pointer text-xs"
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-xs"
							>No results.</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex items-center justify-end space-x-2 py-4">
		{#if table}
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		{/if}
	</div>
</div>
