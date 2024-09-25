import { gql } from "graphql-request";

export const productVariantUpdateQuery = gql`
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        id
        product {
          id
          title
        }
        title
        inventoryItem {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
