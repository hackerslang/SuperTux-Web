// https://gist.github.com/IDDT/432a32b94e8ad675be3aa5e2491609a7
export class AsyncLock {
    constructor() {
        this.awaitable = Promise.resolve();
    }

    async acquire() {
        let resolver;
        const awaitable = this.awaitable;
        this.awaitable = new Promise((x) => { resolver = x })
        await awaitable;
        return resolver;
    }
}