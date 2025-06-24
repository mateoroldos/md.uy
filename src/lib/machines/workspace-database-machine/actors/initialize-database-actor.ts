import { fromPromise } from 'xstate';
import { initNotesDatabase } from '$lib/services/tinybase';

interface InitializeDatabaseInput {
	workspaceId: string;
}

export const initializeDatabaseActor = fromPromise(
	async ({ input }: { input: InitializeDatabaseInput }) => {
		return await initNotesDatabase(input.workspaceId);
	}
);
