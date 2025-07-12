# [express-swagger-autogen](https://npmjs.org/express-swagger-autogen)

A library that auto generates swagger docs to your endpoints from express.

## Installation

```bash
npm install express zod express-swagger-autogen
```

You must set these configs in your `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

## Usage

1. You **must** use the `Router` instance from express.
2. The autogen must be executed in the end your router stack.

For example:

```js
import express from "express";
import expressSwaggerAutogen from "express-swagger-autogen";

const router = express.Router();

router.get("/healthcheck", controller);
router.get("/user/:id", controller);
// others routes ...

expressSwaggerAutogen(router);
// Then the autogen will generate documentation for your endpoints also with path parameters.

const app = express();
app.use(router);
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));
```

You may set some **configurations** as the second parameter of the autogen:

1.  You own setup object:

```js
const config = {
  setup: {
    openapi: "3.0.0",
    info: {
      title: "API Name" || process.env.npm_package_name,
      version: "1.0.0" || process.env.npm_package_version,
    },
  },
};

expressSwaggerAutogen(router, config);
```

2. You also may detail your endpoint documentation using the `Documentation` decorator:

```js
import express, { Request, Response } from "express";
import z from "zod";
import expressSwaggerAutogen, { Documentation, StatusCodes } from "express-swagger-autogen";

const router = express.Router();

/* You may validate the schema inside your handler */
const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

abstract class UserController {
  @Documentation({
    summary: "User login",
    description: "Endpoint for user login",
    zod: {
      requestBody: LoginSchema,
      responses: {
        [StatusCodes.OK]: z.void().describe("User logged in successfully"),
        [StatusCodes.BAD_REQUEST]: z.object({
          message: z.string().describe("Message describing the error").meta({
            example: "Invalid email",
          }),
        }),
        [StatusCodes.UNAUTHORIZED]: z.void().describe("Invalid credentials"),
      },
    },
  })
  static login(req: Request, res: Response) {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: parsed.error.message });
    }

    const { email, password } = parsed.data;

    /*
    const user = repository.getUser(email, password);
    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED);
    }
    */

    return res.status(StatusCodes.OK);
  }
}

router.post("/user/login", UserController.login);

expressSwaggerAutogen(router);

const app = express();
app.use(router);
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));
```

#### [See some examples here about how to use.](https://github.com/CarlosSLoureiro/express-swagger-autogen/tree/main/examples)

## License

MIT
