/**
 * Cache the evaluation of a promise based on its arguments if it succeeds.
 * @param {Function} fn
 * @returns {Function}
 */
export default (fn) => {
    const cache = {};
    return async (...arg) => {
        const key = JSON.stringify(arg);
        if (cache[key]) {
            return cache[key];
        }
        try {
            cache[key] = fn(...arg);
            return await cache[key];
        } catch (e) {
            delete cache[key];
            throw e;
        }
    };
};
