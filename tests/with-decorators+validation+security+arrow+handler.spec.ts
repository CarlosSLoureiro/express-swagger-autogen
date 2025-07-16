import { expect, test } from "@playwright/test";

test.describe("test example: with-decorators+validation+security+arrow+handler", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/documentation");

    await expect(page).toHaveTitle(/Swagger UI/i);
  });

  test("should validate if swagger have Authorize option", async ({ page }) => {
    const authorizeButton = page.locator(".swagger-ui .authorize");
    await expect(authorizeButton).toBeVisible();
    await authorizeButton.click();
    await expect(page.locator(".swagger-ui .auth-container")).toContainText("bearerAuth");
  });

  test("should validate if endpoint POST /auth/login is documented", async ({ page }) => {
    const element = page.locator("#operations-auth-post_auth_login");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Endpoint for user login")).toBeVisible();

    await element.click();

    const requestBody = element.locator(".opblock-section-request-body code");
    await expect(requestBody).toBeVisible();

    const jsonBody = JSON.parse(await requestBody.innerText());
    const expectedBody = {
      email: "user@example.com",
      password: "string",
    };
    expect(expectedBody).toEqual(jsonBody);

    const responses: Record<string, any> = {
      "200": {
        message: "User logged in successfully",
      },
      "400": {
        message: "Invalid email",
        body: {
          message: "Invalid email",
        },
      },
      "401": {
        message: "Invalid credentials",
      },
    };

    for (const [code, description] of Object.entries(responses)) {
      const responseLocator = element.locator(`.responses-table tr[data-code="${code}"]`);
      await expect(responseLocator).toBeVisible();
      await responseLocator.scrollIntoViewIfNeeded();
      await expect(responseLocator.locator(`text=${description.message}`)).toBeVisible();

      if (description?.body) {
        await expect(responseLocator.locator(".highlight-code code")).toBeVisible();

        const responseBody = await responseLocator.locator(".highlight-code code").innerText();
        const parsedBody = JSON.parse(responseBody);
        expect(parsedBody).toEqual(description.body);
      }
    }
  });

  test("should validate if endpoint GET /auth/user-data is documented", async ({ page }) => {
    const element = page.locator("#operations-auth-get_auth_user_data");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Endpoint for user data")).toBeVisible();

    await expect(element.locator(".authorization__btn")).toBeVisible();

    await element.click();

    const responses: Record<string, any> = {
      "200": {
        message: "User data retrieved successfully",
        body: {
          user: {},
        },
      },
    };

    for (const [code, description] of Object.entries(responses)) {
      const responseLocator = element.locator(`.responses-table tr[data-code="${code}"]`);
      await expect(responseLocator).toBeVisible();
      await responseLocator.scrollIntoViewIfNeeded();
      await expect(responseLocator.locator(`text=${description.message}`)).toBeVisible();

      if (description?.body) {
        await expect(responseLocator.locator(".highlight-code code")).toBeVisible();

        const responseBody = await responseLocator.locator(".highlight-code code").innerText();
        const parsedBody = JSON.parse(responseBody);
        expect(parsedBody).toEqual(description.body);
      }
    }
  });

  test("should validate if endpoint POST /auth/logout is documented", async ({ page }) => {
    const element = page.locator("#operations-auth-post_auth_logout");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=Endpoint for user logout")).toBeVisible();

    await element.click();

    const responses: Record<string, any> = {
      "200": {
        message: "Successful",
      },
    };

    for (const [code, description] of Object.entries(responses)) {
      const responseLocator = element.locator(`.responses-table tr[data-code="${code}"]`);
      await expect(responseLocator).toBeVisible();
      await responseLocator.scrollIntoViewIfNeeded();
      await expect(responseLocator.locator(`text=${description.message}`)).toBeVisible();
    }
  });
});
