import express, { Request, Response } from "express";
import expressSwaggerAutogen from "../src/autogen"; /* replace with "express-swagger-autogen"  */

const router = express.Router();

abstract class ProductController {
  static list(req: Request, res: Response) {
    res.status(200).json({ products: [] });
  }
  static post(req: Request, res: Response) {
    res.status(201).json({ status: "created" });
  }
  static delete(req: Request, res: Response) {
    res.status(404).json();
  }
  static buy(req: Request, res: Response) {
    res.status(200).json({ method: req.params.method });
  }
}

abstract class UserController {
  static login(req: Request, res: Response) {
    res.status(200).json({ user: "logged in" });
  }
  static purchases(req: Request, res: Response) {
    res.status(200).json({ purchases: [] });
  }
  static update(req: Request, res: Response) {
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

expressSwaggerAutogen(router);

const app = express();
app.use(express.json());
app.use(router);

const port = process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || 3000;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
