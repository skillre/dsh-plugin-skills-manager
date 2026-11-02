import { throwIfAborted } from './errors.js';
export async function mapLimit(items, concurrency, operation, signal) {
    const results = new Array(items.length);
    let next = 0;
    let failed = false;
    let failure;
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (!failed && next < items.length) {
            const index = next++;
            try {
                throwIfAborted(signal);
                results[index] = await operation(items[index], index);
            }
            catch (error) {
                failed = true;
                failure ??= error;
            }
        }
    });
    await Promise.allSettled(workers);
    if (failed)
        throw failure;
    return results;
}
