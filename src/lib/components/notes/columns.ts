import type { ColumnDef } from '@tanstack/table-core';
import type { Note } from '$lib/db';
import { createRawSnippet } from 'svelte';
import { renderSnippet, renderComponent } from '$lib/components/ui/data-table/index.js';
import SortButton from '../SortButton.svelte';
import type { CachedNote } from '$lib/services/tinybase';
// import NoteActions from '../NoteActions.svelte';
// import PinnedIcon from '../PinnedIcon.svelte';
// import FavoriteIcon from '../FavoriteIcon.svelte';

export const columns: ColumnDef<CachedNote>[] = [
	// {
	// 	accessorKey: 'isPinned',
	// 	header: () => '',
	// 	cell: ({ row }) => {
	// 		const note = row.original;
	// 		return renderComponent(PinnedIcon, { note });
	// 	},
	// 	filterFn: 'equals',
	// 	enableColumnFilter: true
	// },
	// {
	// 	accessorKey: 'isFavorite',
	// 	header: () => '',
	// 	cell: ({ row }) => {
	// 		const note = row.original;
	// 		return renderComponent(FavoriteIcon, { note });
	// 	},
	// 	filterFn: 'equals',
	// 	enableColumnFilter: true
	// },
	{
		accessorKey: 'title',
		header: ({ column }) =>
			renderComponent(SortButton, {
				onclick: column.getToggleSortingHandler(),
				children: 'Title'
			})
	},
	{
		accessorKey: 'modified',
		header: ({ column }) =>
			renderComponent(SortButton, {
				onclick: column.getToggleSortingHandler(),
				children: 'Last Edited'
			}),
		cell: ({ row }) => {
			const formatter = new Intl.DateTimeFormat('en-US', {
				dateStyle: 'medium'
			});

			const dateCellSnippet = createRawSnippet<[string]>((getDate) => {
				const date = getDate();
				return {
					render: () => `<span>${date}</span>`
				};
			});

			return renderSnippet(dateCellSnippet, formatter.format(new Date(row.getValue('modified'))));
		}
	},
	{
		accessorKey: 'filename',
		header: 'ID',
		cell: ({ row }) => {
			const idCellSnippet = createRawSnippet<[string]>((getId) => {
				const id = getId();
				return {
					render: () => `<span class="font-mono">${id}</span>`
				};
			});

			return renderSnippet(idCellSnippet, row.getValue('filename'));
		}
	}
	// {
	// 	id: 'actions',
	// 	size: 40,
	// 	cell: ({ row }) => renderComponent(NoteActions, { note: row.original })
	// }
];
