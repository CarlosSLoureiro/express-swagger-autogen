import { expect, test } from "@playwright/test";

test.describe("test example: with-decorators+validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/documentation");

    await expect(page).toHaveTitle(/Swagger UI/i);
  });

  test("should validate if endpoint POST /user/login is documented", async ({ page }) => {
    const element = page.locator("#operations-user-post_user_login");
    await expect(element).toBeVisible();

    await element.scrollIntoViewIfNeeded();

    await expect(element.locator("text=User login")).toBeVisible();

    await element.click();

    const requestBody = element.locator(".opblock-section-request-body code");
    await expect(requestBody).toBeVisible();

    const jsonBody = JSON.parse(await requestBody.innerText());
    const expectedBody = {
      email: "user@example.com",
      password: "Xpto1234",
    };
    expect(expectedBody).toEqual(jsonBody);

    const responses: Record<string, any> = {
      "200": {
        message: "User logged in successfully",
        body: {
          status: "logged in",
          user: {
            email: "logged-user@example.com",
            name: "Carlos Loureiro",
            age: 26,
            position: "Software Engineer",
          },
        },
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
});
