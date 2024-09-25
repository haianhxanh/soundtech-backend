import { gql } from "graphql-request";

export const inventoryLevelQuery = gql`
  query inventoryLevel($id: ID!) {
    inventoryLevel(id: $id) {
      id
      quantities(names: ["incoming"]) {
        name
        quantity
      }
      item {
        id
        sku
      }
      location {
        id
        name
      }
    }
  }
`;
