import express, { Request, Response } from "express";
import z from "zod";
import expressSwaggerAutogen, { Documentation, StatusCodes } from "../src/autogen"; /* replace with "express-swagger-autogen"  */

const router = express.Router();

/* You may validate the schema inside your handler */
const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required").meta({
    example: "Xpto1234",
  }),
});

abstract class UserController {
  @Documentation({
    summary: "User login",
    description: "Endpoint for user login",
    zod: {
      requestBody: LoginSchema,
      responses: {
        [StatusCodes.OK]: z
          .object({
            status: z.string().describe("User logged in successfully").meta({
              example: "logged in",
            }),
            user: z
              .object({
                email: z.string().meta({
                  example: "logged-user@example.com",
                }),
                name: z.string().meta({
                  example: "Carlos Loureiro",
                }),
                age: z.number().meta({
                  example: 26,
                }),
                position: z.string().meta({
                  example: "Software Engineer",
                }),
              })
              .describe("Logged user data"),
          })
          .describe("User logged in successfully"),
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

    return res.status(StatusCodes.OK).json({
      status: "logged in",
      user: {
        email,
        name: "Carlos Loureiro",
        age: 26,
        position: "Software Engineer",
      },
    });
  }
}

router.post("/user/login", UserController.login);

expressSwaggerAutogen(router);

const app = express();
app.use(express.json());
app.use(router);

const port = process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || 3000;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
