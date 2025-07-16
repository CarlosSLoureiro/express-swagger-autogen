import { expect, test } from "@playwright/test";

test.describe("test example: with-decorators", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/documentation");

    await expect(page).toHaveTitle(/Swagger UI/i);
  });

  test("should validate if endpoint GET /products is documented", async ({ page }) => {
    const element = page.locator("#operations-product-get_products");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=List all products")).toBeVisible();

    await element.click();

    const parameters = element.locator(".parameters");

    const pageParam = parameters.locator('tr[data-param-name="page"][data-param-in="query"]');
    await expect(pageParam).toBeVisible();
  });

  test("should validate if endpoint POST /product is documented", async ({ page }) => {
    const element = page.locator("#operations-product-post_product");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Create a new product")).toBeVisible();

    await element.click();

    const requestBody = element.locator(".opblock-section-request-body code");
    await expect(requestBody).toBeVisible();

    const jsonBody = JSON.parse(await requestBody.innerText());
    const expectedBody = {
      status: "string",
    };

    expect(expectedBody).toEqual(jsonBody);
  });

  test("should validate if endpoint DELETE /product/:id is documented", async ({ page }) => {
    const element = page.locator("#operations-product-delete_product__id_");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Delete a product")).toBeVisible();

    await element.click();

    await expect(element.locator("text=Endpoint to delete a product by ID")).toBeVisible();

    const parameters = element.locator(".parameters");

    const pageParam = parameters.locator('tr[data-param-name="id"][data-param-in="path"]');

    await expect(pageParam).toBeVisible();

    const response404 = element.locator('.responses-table tr[data-code="404"]');
    await expect(response404.locator("text=Product not found")).toBeVisible();
  });

  test("should validate if endpoint POST /product/:id/buy/:method is documented", async ({ page }) => {
    const element = page.locator("#operations-product-post_product__id__buy__method_");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Buy a product")).toBeVisible();

    await element.click();

    await expect(element.locator("text=Endpoint to buy a product by ID and method")).toBeVisible();

    const parameters = element.locator(".parameters");

    const pathParams = ["id", "method"];

    for (const param of pathParams) {
      const paramLocator = parameters.locator(`tr[data-param-name="${param}"][data-param-in="path"]`);
      await expect(paramLocator).toBeVisible();
    }

    const responses = {
      "200": "OK",
      "400": "Payment failed",
    };

    for (const [code, description] of Object.entries(responses)) {
      const responseLocator = element.locator(`.responses-table tr[data-code="${code}"]`);
      await expect(responseLocator).toBeVisible();
      await expect(responseLocator.locator(`text=${description}`)).toBeVisible();
    }
  });

  test("should validate if endpoint POST /user/login is documented", async ({ page }) => {
    const element = page.locator("#operations-user-post_user_login");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=User login")).toBeVisible();

    await element.click();

    await expect(element.locator("text=Endpoint for user login")).toBeVisible();

    const requestBody = element.locator(".opblock-section-request-body code");
    await expect(requestBody).toBeVisible();

    const jsonBody = JSON.parse(await requestBody.innerText());
    const expectedBody = {
      username: "string",
      password: "string",
    };

    expect(jsonBody).toEqual(expectedBody);

    const response200 = element.locator('.responses-table tr[data-code="200"]');
    await expect(response200.locator("text=User logged in successfully")).toBeVisible();
  });

  test("should validate if endpoint GET /user/purchases is documented", async ({ page }) => {
    const element = page.locator("#operations-user-get_user_purchases");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Get user purchases")).toBeVisible();

    await element.click();

    await expect(element.locator("text=Endpoint to get user purchases")).toBeVisible();

    const parameters = element.locator(".parameters");

    const pageParam = parameters.locator('tr[data-param-name="page"][data-param-in="query"]');
    await expect(pageParam).toBeVisible();
  });

  test("should validate if endpoint PUT /user/update is documented", async ({ page }) => {
    const element = page.locator("#operations-user-put_user_update");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Update user information")).toBeVisible();

    await element.click();

    const requestBody = element.locator(".opblock-section-request-body code");
    await expect(requestBody).toBeVisible();

    const jsonBody = JSON.parse(await requestBody.innerText());
    const expectedBody = {
      name: "Carlos Loureiro",
      age: 26,
      position: "Software Engineer",
    };

    expect(expectedBody).toEqual(jsonBody);
  });

  test("should validate if endpoint POST /user/logout is documented", async ({ page }) => {
    const element = page.locator("#operations-user-post_user_logout");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await element.click();

    const response200 = element.locator('.responses-table tr[data-code="200"]');
    await expect(response200.locator("text=Successful")).toBeVisible();
  });
});
