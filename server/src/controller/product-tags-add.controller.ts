import { Request, Response } from "express";
import dotenv from "dotenv";
import { promisify } from "util";
import { GraphQLClient } from "graphql-request";
import { tagsAddMutation } from "../queries/tagsAdd";
import { productQuery } from "../queries/product";
const sleep = promisify(setTimeout);
const sleepTime = 500;
dotenv.config();

const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

const feed = "/Users/hanka/shopify/soundtech/materials/soundtech-products.xlsx";

export const product_tags_add = async (req: Request, res: Response) => {
  const client = new GraphQLClient(
    `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      // @ts-ignore
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    }
  );

  let productId = req?.body?.admin_graphql_api_id;
  // productId = "gid://shopify/Product/8580532797697";

  let tags = "";
  let product = await client.request(productQuery, {
    id: productId,
  });

  let productMetafields = product?.product?.metafields.edges;

  for (const [index, spec] of specs.entries()) {
    let specNamespace = spec.split(".")[0];
    let specKey = spec.split(".")[1];
    let hasSpec = productMetafields?.find(
      (meta: any) =>
        meta.node.namespace == specNamespace && meta.node.key == specKey
    );

    if (hasSpec) {
      if (hasSpec.node.value.includes("[")) {
        const string = hasSpec.node.value
          .replace('["', "")
          .replace('"]', "")
          .replaceAll('"', "");

        const array = string.split(",");
        array.forEach((item: string) => {
          tags += "m_" + item + ",";
        });
      } else {
        tags += "m_" + hasSpec.node.value + ",";
      }
    }
  }

  tags += "Tags added";
  console.log(productId, tags);
  const newTags = await client.request(tagsAddMutation, {
    id: productId,
    tags: tags,
  });
  return res.json(newTags);
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
