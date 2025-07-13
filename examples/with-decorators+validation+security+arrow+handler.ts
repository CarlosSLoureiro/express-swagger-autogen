import express, { Request, Response } from "express";
import z from "zod";
import expressSwaggerAutogen, { Documentation, StatusCodes } from "../src/autogen"; /* replace with "express-swagger-autogen"  */

const router = express.Router();

/* You may validate the schema inside your handler */
const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

class LoginController {
  @Documentation({
    summary: "Endpoint for user login",
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
  public handler = (req: Request, res: Response) => {
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
  };
}

class UserController {
  @Documentation({
    summary: "Endpoint for user data",
    security: [{ bearerAuth: [] }],
    zod: {
      responses: {
        [StatusCodes.OK]: z
          .object({
            user: z.object({}).describe("User data"),
          })
          .describe("User data retrieved successfully"),
      },
    },
  })
  public handler = (req: Request, res: Response) => {
    return res.status(StatusCodes.OK).json({ user: {} });
  };
}

class LogoutController {
  @Documentation({
    summary: "Endpoint for user logout",
  })
  handler(req: Request, res: Response) {
    return res.status(StatusCodes.OK);
  }
}

const controllers = {
  login: new LoginController(),
  user: new UserController(),
  logout: new LogoutController(),
};

router.post("/auth/login", controllers.login.handler);
router.get("/auth/user-data", controllers.user.handler);
router.post("/auth/logout", controllers.logout.handler);

expressSwaggerAutogen(router, {
  setup: {
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
});

const app = express();
app.use(router);
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));
