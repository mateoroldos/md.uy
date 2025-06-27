export const findNextAvailableNumber = (
	existingNumbers: Set<number>,
	startFrom: number = 2
): number => {
	let counter = startFrom;
	while (existingNumbers.has(counter)) {
		counter++;
	}
	return counter;
};
