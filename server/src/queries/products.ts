import { gql } from "graphql-request";

export const productsQuery = gql`
  query getProducts($query: String!) {
    products(first: 250, query: $query) {
      edges {
        node {
          id
          tags
          updatedAt
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
`;
