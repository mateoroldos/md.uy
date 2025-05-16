<script lang="ts">
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
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

	let notes = liveQuery(() => db.notes.toArray());

	const notas = $derived($notes || []);

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return notas;
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
	<div class="flex items-center gap-4 py-4">
		<Input
			placeholder="Filter titles..."
			value={table?.getColumn('title')?.getFilterValue() as string}
			onchange={(e) => table?.getColumn('title')?.setFilterValue(e.currentTarget.value)}
			oninput={(e) => table?.getColumn('title')?.setFilterValue(e.currentTarget.value)}
			class="max-w-sm"
		/>

		<div class="flex gap-2">
			<Button
				variant={table?.getColumn('isPinned')?.getFilterValue() ? 'default' : 'outline'}
				size="sm"
				onclick={() => {
					const column = table?.getColumn('isPinned');
					column?.setFilterValue(column?.getFilterValue() ? null : true);
				}}
			>
				<Pin class="mr-2 h-4 w-4" />
				Pinned
			</Button>

			<Button
				variant={table?.getColumn('isFavorite')?.getFilterValue() ? 'default' : 'outline'}
				size="sm"
				onclick={() => {
					const column = table?.getColumn('isFavorite');
					column?.setFilterValue(column?.getFilterValue() ? null : true);
				}}
			>
				<Star class="mr-2 h-4 w-4" />
				Favorites
			</Button>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
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
						onclick={() => goto(`/${row.original.id}`)}
						class="cursor-pointer"
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
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
