import { gql } from "graphql-request";

export const inventoryItemQuery = gql`
  query inventoryItem($id: ID!) {
    inventoryItem(id: $id) {
      id
      tracked
      sku
      updatedAt
      inventoryLevels(first: 10) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;
