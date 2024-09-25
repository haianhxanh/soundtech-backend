import { chromium } from "playwright";
const { ATF_WEB_SEARCH_URL } = process.env;

export const scrape = async (mainnumber: string) => {
  let browser;
  let productDetails = {};
  try {
    browser = await chromium.launch({
      headless: true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    const searchUrl = (ATF_WEB_SEARCH_URL as string) + mainnumber;
    await page.goto(searchUrl);
    try {
      const descriptionCount = await page
        .locator(".detail-content-left")
        .count();
      const imageCount = await page
        .locator(".product--image-container .image--media img")
        .count();

      if (descriptionCount > 0) {
        const description = page.locator(".detail-content-left");
        if (description) {
          const innerHTML = await description.innerHTML();
          productDetails = {
            description: innerHTML,
          };
        }

        if (imageCount > 0) {
          const images = page.locator(
            ".product--image-container .image--media img"
          );
          // Evaluate all elements and map through them
          const imageUrls = await images.evaluateAll((imgs) =>
            imgs.map((img: any) => img.srcset)
          );

          let imageSources = "";
          for (const url of imageUrls) {
            imageSources += url.split(",")[0] + ",";
          }
          productDetails = {
            ...productDetails,
            images: imageSources,
          };
        }
      } else {
        console.log("not found");
        await browser.close();
      }
    } catch (err) {
      console.log("Element not found:", err);
      await browser.close();
    }
  } catch (err) {
    console.log("not found");
  }

  return productDetails;
};
