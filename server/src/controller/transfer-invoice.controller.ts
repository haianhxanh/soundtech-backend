import express, { Request, Response } from "express";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { promisify } from "util";
import { productVariantQuery } from "../queries/productVariant";
import { calculatePaymentDueDate } from "../utils/helpers";
const sleep = promisify(setTimeout);
dotenv.config();
const {
  ACCESS_TOKEN,
  STORE,
  API_VERSION,
  EUROFAKTURA_API_URL,
  EUROFAKTURA_API_USERNAME,
  EUROFAKTURA_API_MD5PASS,
  EUROFAKTURA_API_TOKEN,
} = process.env;

interface Item {
  productCode: string;
  quantity: number;
  vatTransactionType: number;
}
export const transfer_invoice = async (req: Request, res: Response) => {
  let items = req.body.items;

  if (!items || items.length == 0)
    return res.status(400).json({ message: "Items are required" });

  const client = new GraphQLClient(
    `https://${STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      // @ts-ignore
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
    }
  );
  // const items = [
  //   { "PP-PAM 07": 2 },
  //   {
  //     "HEC HD USB V EIGHT DSP MK2": 3,
  //   },
  // ];
  let totalWeight = 0;
  let paymentDueDate = calculatePaymentDueDate(30);

  try {
    let invoiceObj = {
      username: EUROFAKTURA_API_USERNAME,
      md5pass: EUROFAKTURA_API_MD5PASS,
      token: EUROFAKTURA_API_TOKEN,
      method: "SalesInvoiceCreate",
      parameters: {
        SalesInvoice: {
          buyerDocumentID: "34:477383",
          documentLanguage: "English",
          documentCurrency: "EUR",
          paymentDueDate: paymentDueDate,
          methodOfPayment: "bankTransfer",
          remarks: "",
          Items: [] as Item[],
        },
      },
    };

    for (const [index, item] of items.entries()) {
      const variant = await client.request(productVariantQuery, {
        query: `sku:'${Object.keys(item)[0]}'`,
      });
      console.log(variant);

      if (variant.productVariants.edges.length === 0) continue;

      const productCode = Object.keys(item)[0];
      // @ts-ignore
      const quantity = parseInt(item[productCode]);

      let lineWeight =
        parseFloat(
          variant.productVariants.edges[0].node.inventoryItem.measurement.weight
            .value
        ) * quantity;

      let customDescription =
        variant.productVariants.edges[0].node.product.metafields.edges.find(
          (edge: any) => edge.node.key === "description_custom"
        )?.node.value || "";

      let vendor = variant.productVariants.edges[0].node.product.vendor;

      let productName;
      if (productCode.includes(vendor)) {
        productName = productCode + " - " + customDescription;
      } else {
        productName = vendor + " " + productCode + " - " + customDescription;
      }
      let itemObj = {
        productCode: productCode,
        productName: productName,
        quantity: quantity,
        vatTransactionType: 4,
        description: `HS: ${variant.productVariants.edges[0].node.inventoryItem.harmonizedSystemCode}, ${variant.productVariants.edges[0].node.inventoryItem.measurement.weight.value} kg`,
      };
      invoiceObj.parameters.SalesInvoice.Items.push(itemObj);
      totalWeight += lineWeight;
      sleep(1000);
    }

    if (totalWeight > 0)
      invoiceObj.parameters.SalesInvoice.remarks = `Total weight: ${totalWeight.toFixed(
        2
      )} kg`;

    // return res.status(200).json(invoiceObj);

    const response = await fetch(EUROFAKTURA_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceObj),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return res.status(200).json({ errorResponse });
    }
    const jsonResponse = await response.json();
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
