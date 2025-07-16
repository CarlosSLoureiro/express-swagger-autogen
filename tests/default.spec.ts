import { expect, test } from "@playwright/test";

test.describe("test example: default", () => {
  test("should validate API endpoints are documented", async ({ page }) => {
    await page.goto("/documentation");

    await expect(page).toHaveTitle(/Swagger UI/i);

    const ids = [
      "operations-tag-products",
      "operations-products-get_products",
      "operations-tag-product",
      "operations-product-post_product",
      "operations-product-delete_product__id_",
      "operations-product-post_product__id__buy__method_",
      "operations-tag-user",
      "operations-user-post_user_login",
      "operations-user-get_user_purchases",
      "operations-user-put_user_update",
    ];

    for (const id of ids) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });
});
