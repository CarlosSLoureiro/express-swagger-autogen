import { Router } from "express";

import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { OpenAPI3, PathsObject } from "openapi-typescript";
import swaggerUi from "swagger-ui-express";
import z from "zod";
import { createDocument } from "zod-openapi";
import { ExpressSwaggerAutogenValidationError } from "./errors";
import { ExpressSwaggerAutogenUtils, HandlerDocumentation } from "./utils";

export type ExpressSwaggerAutogenDocsOptions = {
  setup?: Partial<OpenAPI3>;
  basePath?: string;
  endpoint?: string;
  validatePaths?: boolean;
  includeCustomQueryParams?: boolean;
};

/**
 * Generates Swagger documentation for an Express application.
 *
 * @param {Router} router - The Express Router instance.
 * @param {ExpressSwaggerAutogenDocsOptions} [options] - Optional configuration options.
 * @param {Partial<OpenAPI3>} [options.setup] - Custom OpenAPI3 setup for Swagger UI.
 * @param {string} [options.basePath] - Base path to prepend to all endpoints.
 * @param {string} [options.endpoint] - The endpoint where the Swagger UI will be served. Defaults to "/documentation".
 * @param {boolean} [options.validatePaths] - Whether to validate the paths defined manually against the actual endpoints in the router. If true, it will throw an error if any path or method does not exist in the router endpoints. If false it will just warn in console.
 */
export default function expressSwaggerAutogen(router: Router, options?: ExpressSwaggerAutogenDocsOptions): void {
  // Validate the router instance
  if (!(router instanceof Router)) {
    throw new Error("The first argument must be an instance of express.Router.");
  }

  // Set default options
  options = {
    ...options,
    endpoint: options?.endpoint || "/documentation",
  };

  // List all routes in the router
  let list = ExpressSwaggerAutogenUtils.listRoutes(router);

  // If basePath is provided, prepend it to all paths
  if (options?.basePath) {
    options.endpoint = `${options.basePath}${options.endpoint}`;

    list = list.map((endpoint) => {
      return {
        ...endpoint,
        path: `${options?.basePath}${endpoint.path}`,
      };
    });
  }

  // Validate paths if validatePaths is true
  if (options?.setup?.paths) {
    Object.entries(options.setup.paths).forEach(([path, setup]) => {
      const normalizedPath = ExpressSwaggerAutogenUtils.normalizeSwaggerToExpressPath(path);
      Object.keys(setup).forEach((method) => {
        const endpoint = list.find((endpoint) => endpoint.path === normalizedPath && endpoint.method === method.toUpperCase());

        if (!endpoint) {
          const message = `Endpoint "${method.toUpperCase()} ${normalizedPath}" from "${path}" at setup.paths does not exist in the router.`;

          ExpressSwaggerAutogenUtils.logger(message);

          if (options?.validatePaths) {
            throw new ExpressSwaggerAutogenValidationError(message);
          }
        }
      });
    });
  }

  // Setup paths for documentation
  const paths: Partial<PathsObject> = {};

  list.forEach((endpoint) => {
    const { method, path, handlers } = endpoint;

    const handlerWithDocs = handlers.find((handler) => handler?.documentation);

    if (!paths[path]) {
      paths[path] = {};
    }

    // Documentation for parameters
    const pathParams = ExpressSwaggerAutogenUtils.extractPathParams(path);
    const parameters: any[] = [];

    parameters.push(
      ...pathParams.map((param) =>
        z.string().meta({
          param: {
            name: param,
            in: "path",
            required: true,
          },
        })
      )
    );

    if (handlerWithDocs?.documentation?.zod?.params || handlerWithDocs?.documentation?.parameters) {
      if (handlerWithDocs?.documentation?.parameters) {
        parameters.push(...handlerWithDocs?.documentation?.parameters);
      } else if (handlerWithDocs?.documentation?.zod?.params) {
        parameters.push(...handlerWithDocs?.documentation?.zod?.params);
      }
    } else if (options?.includeCustomQueryParams) {
      parameters.push(
        z
          .object({
            search: z.string().optional().default("How to use auto generate api documentation?"),
          })
          .optional()
          .meta({
            param: {
              in: "query",
              name: "queryParams",
              description: "Custom query parameters",
              style: "form",
              explode: true,
            },
          })
      );
    }

    // Documentation for request body
    let requestBody: any = handlerWithDocs?.documentation?.requestBody;

    if (!requestBody && handlerWithDocs?.documentation?.zod?.requestBody) {
      requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: handlerWithDocs?.documentation?.zod?.requestBody,
          },
        },
      };
    }

    if (!requestBody && ["POST", "PUT", "PATCH"].includes(method)) {
      requestBody = {
        required: false,
        content: {
          "application/json": {
            schema: z.object({}),
          },
        },
      };
    }

    // Documentation for responses
    let responses: any = handlerWithDocs?.documentation?.responses;
    if (!responses && handlerWithDocs?.documentation?.zod?.responses) {
      responses = Object.fromEntries(
        Object.entries(handlerWithDocs?.documentation?.zod?.responses).map(([status, schema]) => [
          status,
          {
            description: schema?.description || getReasonPhrase(status),
            content: !["null", "undefined", "void"].includes(schema.def.type) && {
              "application/json": {
                schema,
              },
            },
          },
        ])
      );
    }

    // Documentation tags
    let tags: string[] = [];
    if (handlerWithDocs?.documentation?.tags) {
      tags = handlerWithDocs?.documentation?.tags;
    } else {
      tags = [ExpressSwaggerAutogenUtils.extractFirstPathName(options?.basePath ? path.slice(options.basePath.length) : path)];
    }

    // Assign the documentation to the path and method
    paths[path][method.toLowerCase()] = {
      ...handlerWithDocs?.documentation,
      tags,
      parameters,
      requestBody,
      responses,
    };
  });

  // Create the OpenAPI document
  const defaultSetup = {
    openapi: "3.0.0",
    info: {
      title: process.env.npm_package_name,
      version: process.env.npm_package_version,
      description:
        "API documentation generated by [Express Swagger Autogen](https://github.com/CarlosSLoureiro/express-swagger-autogen)",
    },
  };

  const setup = {
    ...(options?.setup ? ExpressSwaggerAutogenUtils.merge(defaultSetup, options.setup) : defaultSetup),
    paths: options?.setup?.paths ? ExpressSwaggerAutogenUtils.merge(paths, options.setup.paths) : paths,
  };

  // Normalize paths to Swagger style
  setup.paths = Object.fromEntries(
    Object.entries(setup.paths).map(([path, value]) => [ExpressSwaggerAutogenUtils.normalizeExpressToSwaggerPath(path), value])
  );

  // Serve the Swagger UI
  router.use(options.endpoint!, swaggerUi.serve, swaggerUi.setup(createDocument(setup)));

  ExpressSwaggerAutogenUtils.logger(`Swagger documentation available at endpoint "${options.endpoint}"`);
}

/**
 * Decorator to document a controller method.
 *
 * @param {HandlerDocumentation} documentation - The documentation object for the method.
 * @returns {Function} - The decorator function.
 */
export function Documentation(documentation: HandlerDocumentation): Function {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    (descriptor.value as any).documentation = documentation;
  };
}

export { ExpressSwaggerAutogenValidationError, StatusCodes };
