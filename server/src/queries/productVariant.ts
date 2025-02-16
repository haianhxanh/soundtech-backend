import { gql } from "graphql-request";

export const productVariantQuery = gql`
  query getVariantBySku($query: String!) {
    productVariants(first: 1, query: $query) {
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
          inventoryItem {
            harmonizedSystemCode
            measurement {
              weight {
                value
                unit
              }
            }
          }
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
          product {
            id
            tags
            title
            vendor
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
