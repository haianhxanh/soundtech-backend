import { gql } from "graphql-request";

export const productQuery = gql`
  query getProduct($id: ID!) {
    product(id: $id) {
      node {
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
`;
