import express, { Request, Response } from "express";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { promisify } from "util";
import { inventoryItemQuery } from "../queries/inventoryItem";
import { inventoryLevelQuery } from "../queries/inventoryLevel";
import { locationsQuery } from "../queries/locations";
import { locationQuery } from "../queries/location";
const sleep = promisify(setTimeout);
const sleepTime = 700;
dotenv.config();
const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

export const transfers = async (req: Request, res: Response) => {
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
    const item = await client.request(inventoryItemQuery, {
      id: "gid://shopify/InventoryItem/43027072319637",
    });

    const level = await client.request(inventoryLevelQuery, {
      id: "gid://shopify/InventoryLevel/98296627349?inventory_item_id=44307772276993",
    });

    // const locations = await client.request(locationsQuery, {});
    const location = await client.request(locationQuery, {
      id: "gid://shopify/Location/63970705557",
      inventoryItemId: "gid://shopify/InventoryItem/45930133258497",
    });
    return res.status(200).json({ location });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
