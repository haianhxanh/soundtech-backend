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

export const variants_dimensions = async (req: Request, res: Response) => {
  let feedVariants = xlsx.parse(feed);
  let variantsData = feedVariants[0].data;
  let variantsObjects = variantsData.map((x) => ({
    barcode: x[1],
    width: x[3],
    height: x[4],
    length: x[5],
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
          if (variant.width || variant.height || variant.length) {
            let metafield = [];
            if (variant.width) {
              metafield.push({
                namespace: "specs",
                key: "width",
                type: "number_decimal",
                value: variant.width.toString() || "0",
                ownerId: variantData.product.id,
              });
            }
            if (variant.height) {
              metafield.push({
                namespace: "specs",
                key: "height",
                type: "number_decimal",
                value: variant.height.toString() || "0",
                ownerId: variantData.product.id,
              });
            }
            if (variant.length) {
              metafield.push({
                namespace: "specs",
                key: "length",
                type: "number_decimal",
                value: variant.length.toString() || "0",
                ownerId: variantData.product.id,
              });
            }
            let updatedVariant = await updateMetafield(metafield);
            updatedVariants.push(updatedVariant);
            await sleep(sleepTime);
          }
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
