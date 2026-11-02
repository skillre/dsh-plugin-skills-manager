export declare function mapLimit<T, R>(items: readonly T[], concurrency: number, operation: (item: T, index: number) => Promise<R>, signal?: AbortSignal): Promise<R[]>;
