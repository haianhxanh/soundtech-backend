import { gql } from "graphql-request";

export const productVariantsBulkCreateQuery = gql`
  mutation productVariantsBulkCreate(
    $productId: ID!
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      product {
        id
      }
      productVariants {
        id
        metafields(first: 1) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
