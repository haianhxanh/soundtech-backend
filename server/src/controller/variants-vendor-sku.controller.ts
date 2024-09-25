import express, { Request, Response } from "express";
import xlsx from "node-xlsx";
import axios from "axios";
import dotenv, { parse } from "dotenv";
import { promisify } from "util";
import {
  getProductVariant,
  updateMetafield,
  updateVariant,
} from "../utils/helpers";
const sleep = promisify(setTimeout);
const sleepTime = 700;
dotenv.config();

const feed =
  "/Users/hanka/shopify/soundtech/ATF-products-vendors-sku-weight-dimensions.xlsx";

export const variants_vendor_sku = async (req: Request, res: Response) => {
  let feedVariants = xlsx.parse(feed);
  let variantsData = feedVariants[0].data;
  let variantsObjects = variantsData.map((x) => ({
    barcode: x[1],
    weight: x[2],
    vendor_sku: x[0],
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
        if (variantData) {
          if (variant.vendor_sku) {
            let metafield = [
              {
                namespace: "specs",
                key: "vendor_sku",
                type: "single_line_text_field",
                value: variant.vendor_sku,
                ownerId: variantData.id,
              },
            ];
            let updatedVariant = await updateMetafield(metafield);
            updatedVariants.push(updatedVariant);
            await sleep(sleepTime);
          }
          let input = {
            id: variantData.id,
          };
          const updatedVariant = await updateVariant(input);
          await sleep(sleepTime);
          return res.status(200).json({ updatedVariant });
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
