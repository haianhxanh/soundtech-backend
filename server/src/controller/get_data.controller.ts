import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { promisify } from "util";
import { add_tags, fetch_products } from "../utils/helpers";
const sleep = promisify(setTimeout);
const sleepTime = 700;
dotenv.config();

export const get_data = async (req: Request, res: Response) => {
  try {
    let products = await fetch_products("tag_not:'sold out'");

    // return res.status(200).json({ products });
    let product_ids = products.map((product: any) => product.node.id);

    if (products.length <= 0) {
      return res.status(200).json({ message: "No products found" });
    }

    for (const product of products) {
      await sleep(sleepTime);
      let tag_products = await add_tags(product.node.id, "sold out");
      console.log(product.node.id);
    }
    return res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
