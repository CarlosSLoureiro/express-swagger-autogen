import { Router } from "express";
import { OperationObject } from "openapi-typescript";
import z from "zod";

export interface HandlerDocumentation extends OperationObject {
  zod?: {
    requestBody?: z.ZodTypeAny;
    responses?: Record<string | number, z.ZodTypeAny>;
    params?: z.ZodTypeAny[];
  };
}

interface HandlerWithDocumentation extends Function {
  documentation?: HandlerDocumentation;
}

type ListedRoute = {
  path: string;
  method: string;
  handlers: HandlerWithDocumentation[];
};

export abstract class ExpressSwaggerAutogenUtils {
  static listRoutes(router: Router): ListedRoute[] {
    const rotas = [];

    for (const layer of router.stack) {
      if (layer.route) {
        const path = layer.route.path;
        const route = layer.route as unknown as {
          methods: { [method: string]: boolean };
        };
        const methods = Object.keys(route.methods).filter((method) => route.methods[method]);

        const handlers = layer.route.stack.map((m) => m.handle);

        for (const method of methods) {
          rotas.push({
            path,
            method: method.toUpperCase(),
            handlers,
          });
        }
      }
    }

    return rotas;
  }

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
    const firstSegment = path.split("/").filter((segment) => segment && !segment.startsWith(":"))[0];
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
      const isObject = typeof result[key] === "object" && typeof value === "object" && result[key] !== null && value !== null;

      if (isObject && !isArray) {
        result[key] = ExpressSwaggerAutogenUtils.merge(result[key], value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  static logger = (message: string): void => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`\x1b[1m\x1b[34mExpress Swagger Autogen\x1b[0m: ${message}`);
    }
  };
}
