# [express-swagger-autogen](https://npmjs.org/express-swagger-autogen)

A library that auto generates swagger docs to your endpoints from express.

## Installation

```bash
npm install express-swagger-autogen
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
// others routes ...

expressSwaggerAutogen(router);

const app = express();
app.use(router);
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));
```

You may set some **configurations** as the second parameter of the autogen:

1.  You own swagger object setup:

```js
const config = {
    setup: {
        openapi: "3.0.0",
        info: {
            title: 'API Name' || process.env.npm_package_name,
            version: '1.0.0' || process.env.npm_package_version,
        }
    }
};

expressSwaggerAutogen(router, config);
```

2. You also may edit some endpoint documentation by passing an object with the endpoint path as key and the documentation as value:

```js
router.get("/healthcheck", checkController);
router.post("/login", loginController);

expressSwaggerAutogen(router, {
    setup: {
        paths: {
            "/login": {
                post: {
                    summary: "User login with email and password",
                    parameters: [],
                    requestBody: { /* Your login request interface */ },
                    responses: { /* Your login response interface */ },
                    ... // other OpenAPI properties
                },
            },
        },
    },
});

```

3. The autogen will also validate your **endpoints** and **methods** from `setup.paths` and will dislay a warning if the endpoint set is not defined in your router instance. You also may enable the `validatePaths` flag to throw an error:

```js
router.get("/products", controller);

try {
    expressSwaggerAutogen(router, {
        validatePaths: true,
        setup: {
            paths: {
                "/products": {
                    post: {
                        summary: "Will list your products",
                    },
                },
            },
        },
    });
} catch (error) {
    console.error("Error while setting up Swagger:", error);
    // Method "post" for path "/products" defined in setup.paths does not exist in the router endpoints. 
}

```


## Options
| Option          | Type     | Default Value | Description                                                                 |
|-----------------|----------|---------------|-----------------------------------------------------------------------------|
| `setup`         | `object` | `{}`          | Your own swagger object setup. It will be merged with the default setup. |
| `validatePaths` | `boolean` | `false`       | If true, it will validate the paths defined in `setup.paths`. If a path is defined in `setup.paths` but not in the router, it will throw an error. If false, it will only log a warning. |
| `endpoint`      | `string` | `"/documentation"`  | The endpoint where the swagger UI will be served. If you want to change it, you can pass a different value. For example, if you want to serve the swagger UI at `/api-docs`, you can pass `"/api-docs"`  |
| `basePath`     | `string` | `''`    | Base path to prepend to all endpoints in swagger. |


## License

MIT
