import { ExpressSwaggerAutogenUtils, HandlerDocumentation } from "utils";

/**
 * Decorator to document a controller method.
 *
 * @param {HandlerDocumentation} documentation - The documentation object for the method.
 * @returns {Function} - The decorator function.
 */
export function Documentation(documentation: HandlerDocumentation): Function {
  return function (target: any, propertyKey: string | symbol) {
    // If the method is static arrow or normal method
    const original = target[propertyKey];
    if (typeof original === "function") {
      Reflect.defineMetadata(ExpressSwaggerAutogenUtils.METADATA_KEY, documentation, original);
      return;
    }

    // If it's an instance arrow function (non-static)
    const symbol = Symbol();
    Object.defineProperty(target, propertyKey, {
      set(fn: any) {
        if (typeof fn === "function") {
          Reflect.defineMetadata(ExpressSwaggerAutogenUtils.METADATA_KEY, documentation, fn);
        }
        Object.defineProperty(this, symbol, {
          value: fn,
          writable: true,
          configurable: true,
        });
      },
      get() {
        return this[symbol];
      },
      configurable: true,
    });
  };
}
