import { getContext, setContext } from 'svelte';
import { useMachine, useSelector } from '@xstate/svelte';
import { workspaceMachine as createWorkspaceMachine } from '$lib/machines/workspace-machine/workspace-machine';

const KEY = 'workspace-context';

type WorkspaceMachine = ReturnType<typeof useMachine<typeof createWorkspaceMachine>>;

export function setWorkspaceContext(workspaceMachine: WorkspaceMachine) {
	setContext(KEY, workspaceMachine);
}

export function getWorkspaceContext() {
	const { send, actorRef } = getContext(KEY) as WorkspaceMachine;

	return {
		actorRef,
		notes: useSelector(actorRef, (snapshot) => snapshot.context.notes),
		state: useSelector(actorRef, (snapshot) => snapshot.value),
		lastCreatedNote: useSelector(actorRef, (snapshot) => snapshot.context.lastCreatedNote),
		send
	};
}
