export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel?: () => void } {
  let timeout: NodeJS.Timeout | undefined;

  const debounced = function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = undefined;
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T & { cancel?: () => void };

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return debounced;
}