import { Request, Response } from "express";
import dotenv from "dotenv";
import { promisify } from "util";
import { GraphQLClient } from "graphql-request";
import xlsx from "node-xlsx";
import { createProductObj, mapFeed, mapPriceList } from "../utils/map-feed";
import { productVariantsQuery } from "../queries/productVariants";
import { metafieldsSetQuery } from "../queries/metafieldsSet";
const sleep = promisify(setTimeout);
const sleepTime = 1000;
dotenv.config();

const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

const feed = "/Users/hanka/shopify/soundtech/materials/soundtech-products.xlsx";
export const product_update_tags = async (req: Request, res: Response) => {
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
    let feedMap = mapFeed(feedData);

    return res.json(feedMap);

    for (const [index, item] of feedMap.entries()) {
      // STEP 1: PRE-CHECK
      const existingVariant = await client.request(productVariantsQuery, {
        barcode: item?.variant?.barcode?.toString() || "no barcode",
      });

      let updatedProduct;
      if (existingVariant?.productVariants?.edges[0]?.node?.product?.id) {
        const ownerId = {
          ownerId:
            existingVariant?.productVariants?.edges[0]?.node?.product?.id,
        };
        const tags =
          existingVariant?.productVariants?.edges[0]?.node?.product?.tags;
        if (!tags.includes("Auto uploaded")) {
          console.log(tags);

          continue;
        } else {
          return res
            .status(200)
            .json(existingVariant?.productVariants?.edges[0]?.node?.product);
        }
      }
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
