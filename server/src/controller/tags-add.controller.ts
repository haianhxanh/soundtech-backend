import { Request, Response } from "express";
import dotenv from "dotenv";
import { promisify } from "util";
import { GraphQLClient } from "graphql-request";
import { productsQuery } from "../queries/products";
import { tagsAddMutation } from "../queries/tagsAdd";
const sleep = promisify(setTimeout);
const sleepTime = 500;
dotenv.config();

const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

const feed = "/Users/hanka/shopify/soundtech/materials/soundtech-products.xlsx";

export const tags_add = async (req: Request, res: Response) => {
  const updatedProducts = [];
  const client = new GraphQLClient(
    `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      // @ts-ignore
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    }
  );

  const products = await client.request(productsQuery, {
    query: "tag_not:'Tags added' AND status:'ACTIVE,DRAFT'",
  });

  for (const [index, product] of products.products.edges.entries()) {
    let tags = "";
    let productId = product?.node?.id;
    let productMetafields = product?.node?.metafields.edges;
    for (const [index, spec] of specs.entries()) {
      let specNamespace = spec.split(".")[0];
      let specKey = spec.split(".")[1];
      let hasSpec = productMetafields.find(
        (meta: any) =>
          meta.node.namespace == specNamespace && meta.node.key == specKey
      );
      if (hasSpec) {
        tags +=
          "m_" + hasSpec.node.value.replace('["', "").replace('"]', "") + ",";
      }
    }
    tags += "Tags added";
    console.log(productId, tags);
    const newTags = await client.request(tagsAddMutation, {
      id: productId,
      tags: tags,
    });
    updatedProducts.push(productId);
    sleep(sleepTime);
  }

  return res.json(updatedProducts);
};

const specs = [
  "specs.channels",
  "amp.built_in_dsp",
  "amp.power_rms_per_speaker_channel",
  "amp.power_rms_for_subwoofer",
  "specs.operational_voltage2",
  "spk.series",
  "spk.type",
  "specs.car_specific",
  "sub.unit_type",
  "specs.size",
  "acc.application",
  "acc.type",
];
