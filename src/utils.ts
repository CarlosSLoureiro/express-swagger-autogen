export abstract class ExpressSwaggerAutogenUtils {
  static extractPathParams = (path: string): string[] => {
    const paramRegex = /:([a-zA-Z0-9_]+)/g;
    const params: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = paramRegex.exec(path)) !== null) {
      params.push(match[1]);
    }

    return params;
  };

  static extractFirstPathName = (path: string): string => {
    const firstSegment = path
      .split("/")
      .filter((segment) => segment && !segment.startsWith(":"))[0];
    return firstSegment || "";
  };

  static normalizeSwaggerToExpressPath = (path: string): string => {
    return path.replace(/\/\{([a-zA-Z0-9_]+)\}/g, "/:$1");
  };

  static normalizeExpressToSwaggerPath = (path: string): string => {
    return path.replace(/\/:([a-zA-Z0-9_]+)/g, "/{$1}");
  };

  static merge = (target: any, source: any) => {
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
      const isArray = Array.isArray(value);
      const isObject =
        typeof result[key] === "object" &&
        typeof value === "object" &&
        result[key] !== null &&
        value !== null;

      if (isObject && !isArray) {
        result[key] = ExpressSwaggerAutogenUtils.merge(result[key], value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };
}
