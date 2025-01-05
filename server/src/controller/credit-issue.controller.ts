import { Request, Response } from "express";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { promisify } from "util";
import { orderQuery } from "../queries/order";
import { storeCreditAccountCreditMutation } from "../queries/storeCreditAccountCredit";
import axios from "axios";
const sleep = promisify(setTimeout);
dotenv.config();
const {
  ACCESS_TOKEN,
  STORE,
  API_VERSION,
  SLACK_WEBHOOK_URL,
  SLACK_DEV_WEBHOOK_URL,
  SHOPIFY_ADMIN_ORDER_URL,
  SHOPIFY_ADMIN_CUSTOMER_URL,
} = process.env;

export const credit_issue = async (req: Request, res: Response) => {
  let orderId = req.body.admin_graphql_api_id;

  if (!orderId) return res.status(200).json({ message: "Missing orderId" });

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
    const order = await client.request(orderQuery, { id: orderId });
    // return res.status(200).json(order);
    const isBankPayment = order.order.paymentGatewayNames.find((name: string) =>
      name.includes("Bank")
    );
    if (!isBankPayment) {
      return res
        .status(200)
        .json({ message: `Order ${orderId} not paid by bank` });
    }

    // 1.5% of the order subtotal
    const credit = parseFloat(
      (order.order.subtotalPriceSet.shopMoney.amount * 0.015).toFixed(2)
    );

    let customerId = order.order.customer.id;
    // customerId = "gid://shopify/Customer/6237377462529";

    const creditMutation = await client.request(
      storeCreditAccountCreditMutation,
      {
        id: customerId,
        creditInput: {
          creditAmount: {
            amount: credit,
            currencyCode: "AUD",
          },
        },
      }
    );

    let orderUrl = `${SHOPIFY_ADMIN_ORDER_URL}${orderId.replace(
      "gid://shopify/Order/",
      ""
    )}`;
    let customerUrl = `${SHOPIFY_ADMIN_CUSTOMER_URL}${customerId.replace(
      "gid://shopify/Customer/",
      ""
    )}`;
    let orderName = order?.order?.name;
    let customerEmail = order?.order?.customer?.email;
    let textMessage;
    if (!customerEmail) {
      textMessage = `A credit of ${credit} AUD has been issued for order <${orderUrl}|${orderName}>`;
    } else {
      textMessage = `A credit of ${credit} AUD has been issued for order <${orderUrl}|${orderName}> to <${customerUrl}|customer> ${customerEmail}`;
    }

    try {
      const slackMessage = await axios.post(SLACK_WEBHOOK_URL || "", {
        text: textMessage,
      });
    } catch (error) {
      console.error(error);
    }
    return res.status(200).json(creditMutation);
  } catch (error) {
    return res.status(200).json({ error });
  }
};
