// A simple debounce utility function.
// It delays the execution of a function until after `wait` milliseconds have passed since the last time it was invoked.

const debounce = <F extends (...args: any[]) => any>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null;

    return function executedFunction(...args: Parameters<F>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);
    };
};

export default debounce;
