import express, { Request, Response } from "express";
import z from "zod";
import expressSwaggerAutogen, { Documentation, StatusCodes } from "../src/autogen"; /* replace with "express-swagger-autogen"  */

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
