import axios from "axios";
import dotenv from "dotenv";
import { query } from "express";
import { promisify } from "util";
import { BRANDS, GENERAL_SPECS, TYPES } from "./constants";
dotenv.config();
const sleep = promisify(setTimeout);
const sleepTime = 700;
const { ACCESS_TOKEN, STORE, API_VERSION } = process.env;

export const fetch_products = async (queries: string) => {
  // queries: "tag_not:'sold out'"

  let cursor = "";
  let hasNextPage = true;
  let products: any[] = [];

  while (hasNextPage) {
    const response = await axios.post(
      `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
      {
        query: `
        query getProducts {
          products(query:"${queries}", first: 250${
          cursor ? `, after: "${cursor}"` : ""
        }) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                title
                id
                status
                totalInventory
                tracksInventory
                tags
                metafields(first: 100) {
                  edges {
                    node {
                      namespace
                      key
                      value
                      id
                    }
                  }
                }
                variants(first: 100) {
                  edges {
                    node {
                      id
                      inventoryPolicy
                    }
                  }
                }
              }
            }
          }
        }
      `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN!,
        },
      }
    );

    const data = response.data.data.products;
    hasNextPage = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.endCursor;
    products = products.concat(data.edges);
    sleep(sleepTime);
  }

  if (products.length > 0) {
    // const activeSoldoutProducts = products.filter((edge: ProductEdge) => {
    //   return (
    //     edge.node.status === "ACTIVE" &&
    //     edge.node.totalInventory <= 0 &&
    //     // @ts-ignore
    //     edge.node.variants?.edges.every(
    //       // @ts-ignore
    //       (variant) => variant.node.inventoryPolicy === "DENY"
    //     )
    //   );
    // });

    // if (activeSoldoutProducts.length > 0) {
    //   return activeSoldoutProducts;
    // } else {
    //   return [];
    // }
    // return data.data.products.edges;
    return products;
  } else {
    return [];
  }
};

export const add_tags = async (id: string, tags: string) => {
  const query = `
  mutation addTags($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        message
      }
    }
  }
  `;

  const variables = {
    id: id,
    tags: tags,
  };

  try {
    const response = await fetch(
      `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const responseData = await response.json();
    if (responseData.errors) {
      console.error("GraphQL Errors:", responseData.errors);
      return null;
    }

    return responseData.data;
  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
};

export const firstString = (str: string) => {
  return str.split(" ")[0];
};

export const isStringIncludedInArray = (brand: string): boolean => {
  return BRANDS.includes(brand);
};

export const parseTags = (tags: string[]) => {
  let specsTags = tags.filter((tag) => tag.includes("_"));
  let obj = {};
  for (const tag of specsTags) {
    const [key, value] = tag.split("_");
    // @ts-ignore
    obj[key] = value;
  }
  return obj;
};

export const createSpecsMetafields = async (
  object: any,
  product_type: string
) => {
  let metafields = [];
  for (const key in object) {
    const metaType = mapMetafieldType(key);
    const metaKey = mapMetafieldKey(key);
    let metaValue = key == "car" ? JSON.stringify([object[key]]) : object[key];
    if (metaValue == "2x Channel") {
      metaValue = "2x High level";
    } else if (metaValue == "4x Channel") {
      metaValue = "4x High level";
    } else if (metaValue == "6x Channel") {
      metaValue = "6x High level";
    } else if (metaValue == "8x Channel and more") {
      metaValue = "8x High level";
    }
    if (metaValue == "Other Sizes") {
      metaValue = undefined;
    }
    const metaNamespace = mapMetafieldNamespace(
      metaKey as string,
      product_type
    );
    // console.log("metaNamespace", metaNamespace);
    // console.log("metaKey", metaKey);
    // console.log("metaValue", metaValue);
    // console.log("====");

    if (!metaType || !metaKey || !metaValue) continue;
    let metafield = {
      namespace: metaNamespace,
      key: metaKey,
      type: metaType,
      value: metaValue,
    };
    metafields.push(metafield);
  }

  return metafields;
};

export const mapMetafieldKey = (key: string) => {
  switch (key) {
    case "brand":
      return "brand";
    case "car":
      return "car_specific";
    case "size":
      return "size";
    case "01-12-class":
      return "class";
    case "01-03-ampDSP?":
      return "built_in_dsp";
    case "01-02-amp-out":
      return "channels";
    case "01-08-amp-in":
      return "rca_input";
    case "01-09-high-in":
      return "high_level_input";
    case "02-02":
      return "type";
    case "03-02":
      return "unit_type";
    case "03-06":
      return "voice_coil_x_impedance";
    case "04-04-DSP-Hi-L-In":
      return "high_level_input";
    case "04-03-DSP":
      return "channels";
    case "04-02-DSP":
      return "rca_input";
    default:
      return undefined;
  }
};

export const mapMetafieldType = (key: string) => {
  switch (key) {
    case "car":
      return "list.single_line_text_field";
    default:
      return "single_line_text_field";
  }
};

export const mapMetafieldNamespace = (key: string, product_type: string) => {
  if (GENERAL_SPECS.includes(key)) return "specs";
  let type = TYPES.find((type) => type.name === product_type);
  return type?.shortcut?.toLowerCase() || "specs";
};

export const createMetafieldObject = async (
  namespace: string,
  key: string,
  type: string,
  value: string,
  ownerId: string
) => {
  return {
    namespace: namespace,
    key: key,
    type: type,
    value: value,
    ownerId: ownerId,
  };
};

export async function updateMetafield(metafields: any) {
  const metafields_query = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
  `;

  let metafields_variables = {
    metafields,
  };

  const post_metafields = await axios
    .post(
      `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
      {
        query: metafields_query,
        variables: metafields_variables,
      },
      {
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN!,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });

  return post_metafields;
}

export const getProductVariant = async (queries: string) => {
  let query = `
    query {
      productVariants(first: 1, query: "${queries}") {
        edges {
          node {
            id
            title
            product {
              id
              title
            }
            inventoryItem {
              id
              measurement {
                weight {
                  value
                }
              }
            }
          }
        }
      }
  }
  `;

  try {
    const response = await fetch(
      `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: query }),
      }
    );

    const responseData = await response.json();
    if (responseData.errors) {
      console.error("GraphQL Errors:", responseData.errors);
      return null;
    }
    if (responseData.data.productVariants.edges.length === 0) {
      return null;
    }
    return responseData.data.productVariants.edges[0].node;
  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
};

export const updateVariant = async (input: any) => {
  let query = `
    mutation {
      productVariantUpdate(input: ${input}) {
        productVariant {
          id
          metafields(first: 100) {
            edges {
              node {
                namespace
                key
                value
              } 
            }
          }
        }
      }
    }`;

  let variables = {
    input: input,
  };

  const response = await axios({
    url: `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ACCESS_TOKEN,
    },
    data: {
      query,
      variables,
    },
  });

  return response.data;
};

export const updateInventoryItem = async (id: string, input: any) => {
  let query = `
    mutation UpdateInventoryItem($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem {
          id
          measurement {
            weight {
              value
              unit
            }
          }
        }
      }
    }`;

  let variables = {
    id: id,
    input: input,
  };

  console.log("variables", variables);

  const response = await axios({
    url: `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ACCESS_TOKEN,
    },
    data: {
      query,
      variables,
    },
  });

  return response.data;
};

export const calculatePaymentDueDate = (daysToAdd: number): string => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function getCurrentTimeISO(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

export const getCurrentTimeReducedByHours = (hours: number): string => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - hours);
  return currentDate.toISOString();
};
