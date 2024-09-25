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
import { productUpdateQuery } from "../queries/productUpdate";
import { metafieldsSetQuery } from "../queries/metafieldsSet";
const sleep = promisify(setTimeout);
const sleepTime = 1000;
dotenv.config();

const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

const feed = "/Users/hanka/shopify/soundtech/materials/soundtech-products.xlsx";
const pricelist = "/Users/hanka/shopify/soundtech/materials/pricelist.xlsx";

export const variant_update = async (req: Request, res: Response) => {
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
    let updatedProducts = [];

    for (const [index, item] of productObj.entries()) {
      // STEP 1: PRE-CHECK
      const existingVariant = await client.request(productVariantsQuery, {
        barcode: item?.variant?.barcode?.toString() || "no barcode",
      });
      // if (index < 2) {
      //   continue;
      // }
      // if (index === 2) {
      //   console.log(item.variant);
      // }
      // if (index > 2) {
      //   break;
      // }
      // if (
      //   existingVariant?.productVariants?.edges[0]?.node?.product?.tags.includes(
      //     "Auto uploaded"
      //   )
      // ) {
      //   continue;
      // }

      // let updatedProduct, updatedVariant;
      // if (existingVariant?.productVariants?.edges[0]?.node?.product?.id) {
      //   const ownerId = {
      //     ownerId:
      //       existingVariant?.productVariants?.edges[0]?.node?.product?.id,
      //   };
      //   let updatedProductMetafields = item.product.metafields.map(
      //     (item: any) => ({
      //       ...item,
      //       ...ownerId,
      //     })
      //   );

      //   updatedProduct = await client.request(metafieldsSetQuery, {
      //     metafields: updatedProductMetafields,
      //   });
      // }
      // sleep(sleepTime);

      if (existingVariant?.productVariants?.edges[0]?.node?.id) {
        // let inventoryItem = {};
        // if (item.variant.inventoryItem.measurement) {
        //   // @ts-ignore
        //   inventoryItem.measurement = item.variant.inventoryItem.measurement;
        // }
        // if (item.variant.inventoryItem.harmonizedSystemCode) {
        //   // @ts-ignore
        //   inventoryItem.harmonizedSystemCode =
        //     item.variant.inventoryItem.harmonizedSystemCode;
        // }
        // if (item.variant.inventoryItem.countryCodeOfOrigin) {
        //   // @ts-ignore
        //   inventoryItem.countryCodeOfOrigin =
        //     item.variant.inventoryItem.countryCodeOfOrigin;
        // }
        // if (item.variant.inventoryItem.cost) {
        //   // @ts-ignore
        //   inventoryItem.cost = item.variant.inventoryItem.cost;
        // }

        let updatedVariant;
        // updatedVariant = await client.request(productVariantUpdateQuery, {
        //   input: {
        //     id: existingVariant?.productVariants?.edges[0]?.node?.id,
        //     // inventoryItem: inventoryItem,
        //     price: item.variant.price,
        //     compareAtPrice: item.variant.compareAtPrice,
        //   },
        // });
        const ownerId = {
          ownerId: existingVariant?.productVariants?.edges[0]?.node?.id,
        };
        let updatedVariantMetafields = item.variant.metafields.map(
          (item: any) => ({
            ...item,
            ...ownerId,
          })
        );
        updatedVariant = await client.request(metafieldsSetQuery, {
          metafields: updatedVariantMetafields,
        });

        console.log(ownerId);

        updatedProducts.push(ownerId);
      }

      // sleep(sleepTime);

      // console.log(
      //   item.product.title + " updated",
      //   existingVariant?.productVariants?.edges[0]?.node?.product?.id
      // );

      // updatedProducts.push(
      //   existingVariant?.productVariants?.edges[0]?.node?.product?.id
      // );
    }

    return res.status(200).json({ updatedProducts });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
