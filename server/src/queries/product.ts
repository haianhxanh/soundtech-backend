import { gql } from "graphql-request";

export const productQuery = gql`
  query getProduct($id: ID!) {
    product(id: $id) {
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
`;
