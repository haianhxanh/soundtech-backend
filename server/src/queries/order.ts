import { gql } from "graphql-request";

export const orderQuery = gql`
  query Order($id: ID!) {
    order(id: $id) {
      id
      name
      subtotalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      customer {
        id
        email
      }
      paymentGatewayNames
    }
  }
`;
