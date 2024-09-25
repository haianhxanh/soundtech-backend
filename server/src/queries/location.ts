import { gql } from "graphql-request";

export const locationQuery = gql`
  query location($id: ID!, $inventoryItemId: ID!) {
    location(id: $id) {
      id
      name
      inventoryLevel(inventoryItemId: $inventoryItemId) {
        quantities(names: ["incoming"]) {
          name
          quantity
        }
      }
    }
  }
`;
