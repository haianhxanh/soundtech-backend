import { gql } from "graphql-request";

export const productVariantsQuery = gql`
  query getVariantBySku($barcode: String!) {
    productVariants(first: 1, query: $barcode) {
      edges {
        node {
          id
          title
          selectedOptions {
            name
            value
            optionValue {
              id
              name
            }
          }
          product {
            id
            tags
            metafields(first: 100) {
              edges {
                node {
                  id
                  key
                  value
                  namespace
                }
              }
            }
          }
        }
      }
    }
  }
`;
