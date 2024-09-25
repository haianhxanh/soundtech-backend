import { Request, Response } from "express";
import dotenv from "dotenv";
import { promisify } from "util";
import { GraphQLClient } from "graphql-request";
import xlsx from "node-xlsx";
import { createProductObj, mapFeed, mapPriceList } from "../utils/map-feed";
import { productVariantsQuery } from "../queries/productVariants";
import { productCreateQuery } from "../queries/productCreate";
import { productVariantUpdateQuery } from "../queries/productVariantUpdate";
import { scrape } from "../utils/scrape";
const sleep = promisify(setTimeout);
const sleepTime = 1500;
dotenv.config();

const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

const feed =
  "/Users/hanka/shopify/soundtech/materials/soundtech-products-no-variants.xlsx";
const pricelist = "/Users/hanka/shopify/soundtech/materials/pricelist.xlsx";

export const product_import = async (req: Request, res: Response) => {
  let newProducts = [];
  const client = new GraphQLClient(
    `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      // @ts-ignore
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    }
  );

  try {
    const parsedFeed = xlsx.parse(feed);
    let feedData = parsedFeed[0].data;

    const parsedPricelist = xlsx.parse(pricelist);
    let pricelistData = parsedPricelist[0].data;

    let feedMap = mapFeed(feedData);
    let priceListMap = mapPriceList(pricelistData);

    let productObj = createProductObj(feedMap, priceListMap);

    for (const [index, item] of productObj.entries()) {
      // STEP 1: PRE-CHECK
      const existingVariant = await client.request(productVariantsQuery, {
        barcode: item?.variant?.barcode?.toString() || "no barcode",
      });
      if (existingVariant?.productVariants?.edges.length > 0) {
        console.log(
          `Product variant with Barcode ${item?.variant?.barcode} already exists`
        );
        continue;
      }

      let itemSku = item?.variant?.metafields?.find(
        (meta: any) => meta.key == "vendor_sku"
      )?.value;

      let productDetails = await scrape(itemSku);
      if (productDetails) {
        // @ts-ignore
        if (productDetails.description == "") {
          item.product.tags != ", preliminary";
        } else {
          // Replace all <h2> tags with <h4> tags
          // @ts-ignore
          let modifiedHtml = productDetails?.description
            ?.replace(/<h2>/g, "<h4>")
            .replace(/<\/h2>/g, "</h4>");

          // Replace all <h3> tags with <h2> tags
          modifiedHtml = modifiedHtml
            ?.replace(/<h3>/g, "<h2>")
            .replace(/<\/h3>/g, "</h2>");

          item.product.bodyHtml = modifiedHtml;
        }
        // @ts-ignore
        if (productDetails.images != "") {
          // @ts-ignore
          let images = productDetails.images?.split(",");
          if (images?.length > 0) {
            item.media = images.map((img: any) => {
              if (img != "") {
                return {
                  mediaContentType: "IMAGE",
                  originalSource: img,
                };
              }
            });
          }
        }
      }

      // STEP 2: PREP
      let productCreateObj = {
        input: item.product,
        media: item.media,
      };
      let productVariantObj = item.variant;

      // STEP 3: Create product
      const newProduct = await client.request(
        productCreateQuery,
        productCreateObj
      );

      sleep(sleepTime);

      // STEP 4: Update product variant

      if (
        newProduct &&
        newProduct?.productCreate?.product?.variants?.nodes[0]?.id
      ) {
        // @ts-ignore
        productVariantObj.id =
          newProduct.productCreate.product.variants.nodes[0].id;
      }

      const updatedVariant = await client.request(productVariantUpdateQuery, {
        input: productVariantObj,
      });

      newProducts.push({
        id: newProduct?.productCreate?.product?.id,
        title: newProduct?.productCreate?.product?.title,
      });
      console.log(
        `${newProducts.length} New product created: ${newProduct?.productCreate?.product?.title}, id: ${newProduct?.productCreate?.product?.id}`
      );
      sleep(sleepTime);
    }

    return res.status(200).json(newProducts);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// const readFileAsync = promisify(fs.readFile);
// const parseStringAsync = promisify(parseString);
