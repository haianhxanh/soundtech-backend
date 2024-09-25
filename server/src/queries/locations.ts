import { gql } from "graphql-request";

export const locationsQuery = gql`
  query {
    locations(first: 5) {
      edges {
        node {
          id
          name
          address {
            formatted
          }
        }
      }
    }
  }
`;
