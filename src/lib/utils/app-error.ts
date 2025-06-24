export class AppError extends Error {
	public readonly type: string;
	public readonly context?: Record<string, unknown>;
	public readonly originalError?: unknown;

	constructor(type: string, message: string, context?: Record<string, unknown>) {
		super(message);
		this.name = 'AppError';
		this.type = type;
		this.context = context;
		this.originalError = context?.originalError;
	}
}