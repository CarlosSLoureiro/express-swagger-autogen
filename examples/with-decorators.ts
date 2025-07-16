import express, { Request, Response } from "express";
import z from "zod";
import expressSwaggerAutogen, { Documentation, StatusCodes } from "../src/autogen"; /* replace with "express-swagger-autogen" */

const router = express.Router();

/* Using zod to define schemas */
abstract class ProductController {
  @Documentation({
    tags: ["product"],
    summary: "List all products",
    zod: {
      responses: {
        [StatusCodes.OK]: z
          .object({
            status: z.array(z.object({}).describe("Product object")).describe("List of products"),
          })
          .describe("Successful health check response"),
      },
      params: [
        z.string().meta({
          param: {
            in: "query",
            name: "page",
            description: "Page number for pagination",
          },
        }),
      ],
    },
  })
  static list(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ products: [] });
  }

  @Documentation({
    summary: "Create a new product",
    zod: {
      requestBody: z.object({
        status: z.string().describe("Status of the service"),
      }),
      responses: {
        [StatusCodes.CREATED]: z.object({
          status: z.string().describe("Status of the created resource"),
        }),
      },
    },
  })
  static post(req: Request, res: Response) {
    res.status(StatusCodes.CREATED).json({ status: "created" });
  }

  @Documentation({
    summary: "Delete a product",
    description: "Endpoint to delete a product by ID",
    zod: {
      responses: {
        [StatusCodes.NOT_FOUND]: z.void().describe("Product not found"),
      },
    },
  })
  static delete(req: Request, res: Response) {
    res.status(StatusCodes.NOT_FOUND).json();
  }

  @Documentation({
    summary: "Buy a product",
    description: "Endpoint to buy a product by ID and method",
    zod: {
      responses: {
        [StatusCodes.OK]: z.object({
          method: z.string().describe("Payment successful"),
        }),

        // You may use number or string as keys for status codes
        400: z.void().describe("Payment failed"),
      },
    },
  })
  static buy(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ method: req.params.method });
  }
}

/* Using self OpenAPI documentation */
abstract class UserController {
  @Documentation({
    summary: "User login",
    description: "Endpoint for user login",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              username: { type: "string", description: "Username of the user" },
              password: { type: "string", description: "Password of the user" },
            },
            required: ["username", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "User logged in successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: { type: "string", description: "Logged in user" },
              },
            },
          },
        },
      },
    },
  })
  static login(req: Request, res: Response) {
    res.status(200).json({ user: "logged in" });
  }

  @Documentation({
    summary: "Get user purchases",
    description: "Endpoint to get user purchases",
    parameters: [
      {
        in: "query",
        name: "page",
        description: "Page number for pagination",
        required: false,
        schema: {
          type: "integer",
          default: 1,
        },
      },
    ],
    responses: {
      200: {
        description: "User logged out successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: { type: "string", description: "Logged out user" },
              },
            },
          },
        },
      },
    },
  })
  static purchases(req: Request, res: Response) {
    res.status(200).json({ purchases: [] });
  }

  @Documentation({
    summary: "Update user information",
    zod: {
      requestBody: z.object({
        name: z.string().describe("Name of the user").optional().meta({
          example: "Carlos Loureiro",
        }),
        age: z.number().describe("Age of the user").optional().meta({
          example: 26,
        }),
        position: z.string().describe("Position of the user").optional().meta({
          example: "Software Engineer",
        }),
      }),
    },
  })
  static update(req: Request, res: Response) {
    res.status(200).json({ user: req.body });
  }

  // Not manually documented, will use default documentation
  static logout(req: Request, res: Response) {
    res.status(200).json({ user: req.body });
  }
}

router.get("/products", ProductController.list);
router.post("/product", ProductController.post);
router.delete("/product/:id", ProductController.delete);
router.post("/product/:id/buy/:method", ProductController.buy);

router.post("/user/login", UserController.login);
router.get("/user/purchases", UserController.purchases);
router.put("/user/update", UserController.update);
router.post("/user/logout", UserController.logout);

expressSwaggerAutogen(router);

const app = express();
app.use(express.json());
app.use(router);

const port = process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || 3000;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
