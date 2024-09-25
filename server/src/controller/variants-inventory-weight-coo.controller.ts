import express, { Request, Response } from "express";
import xlsx from "node-xlsx";
import dotenv, { parse } from "dotenv";
import { promisify } from "util";
import {
  getProductVariant,
  updateInventoryItem,
  updateMetafield,
  updateVariant,
} from "../utils/helpers";
const sleep = promisify(setTimeout);
const sleepTime = 700;
dotenv.config();

const feed =
  "/Users/hanka/shopify/soundtech/ATF-products-vendors-sku-weight-dimensions.xlsx";

export const variants_weight_coo = async (req: Request, res: Response) => {
  let feedVariants = xlsx.parse(feed);
  let variantsData = feedVariants[0].data;
  let variantsObjects = variantsData.map((x) => ({
    barcode: x[1],
    weight: x[2],
    coo: x[6],
  }));
  // remove the first row
  variantsObjects = variantsObjects.slice(1, variantsObjects.length);

  let updatedVariants = [];
  try {
    for (const variant of variantsObjects) {
      try {
        const variantData = await getProductVariant(
          `barcode:'${variant.barcode}'`
        );
        console.log(variantData ? variantData.id : variant.barcode);
        if (
          (variant.weight || variant.coo) &&
          variantData &&
          variantData.inventoryItem?.id
        ) {
          let input = {
            countryCodeOfOrigin: variant.coo ? variant.coo : "",
            measurement: {
              weight: {
                value: variant.weight ? variant.weight : 0,
                unit: "KILOGRAMS",
              },
            },
          };

          const updatedVariant = await updateInventoryItem(
            variantData.inventoryItem.id,
            input
          );
          updatedVariants.push(
            updatedVariant.data?.inventoryItemUpdate?.inventoryItem
          );
          await sleep(sleepTime);
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }
    return res.status(200).json({ updatedVariants });
  } catch (error) {
    return res.status(500).json({ error });
  }
};
