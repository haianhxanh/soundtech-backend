import express, { Request, Response } from "express";
import axios from "axios";
import dotenv, { parse } from "dotenv";
import { promisify } from "util";
import {
  add_tags,
  createSpecsMetafields,
  fetch_products,
  firstString,
  isStringIncludedInArray,
  parseTags,
  updateMetafield,
} from "../utils/helpers";
const sleep = promisify(setTimeout);
const sleepTime = 700;
dotenv.config();

export const specs = async (req: Request, res: Response) => {
  try {
    // CHANGE DYNAMICALLY AS NEEDED
    let products = await fetch_products(
      "product_type:'Subwoofers' AND tag_not:'Metafield specs added'"
    );
    // products = products.slice(0, 1);
    let errorProducts = [];
    // START FUNCTION
    for (const product of products) {
      let isAcceptedBrand = isStringIncludedInArray(
        firstString(product.node.title)
      );
      if (!isAcceptedBrand) continue;
      let tagsObj = parseTags(product.node.tags);

      let specsObj = await createSpecsMetafields(tagsObj, "Subwoofers");

      if (specsObj.length === 0) continue;
      specsObj.forEach((entry: any) => {
        entry["ownerId"] = product.node.id;
      });

      const metafield = await updateMetafield(specsObj);
      if (metafield.data.metafieldsSet.userErrors.length > 0) {
        let errObj = {
          product_id: product.node.id,
          errors: metafield.data.metafieldsSet.userErrors,
        };
        errorProducts.push(errObj);
        continue;
      }
      await sleep(sleepTime);
      await add_tags(product.node.id, "Metafield specs added");
      console.log(product.node.id);
      await sleep(sleepTime);
    }
    return res.status(200).json({ errorProducts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
