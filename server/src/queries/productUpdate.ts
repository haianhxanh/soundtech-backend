import { gql } from "graphql-request";

export const productUpdateQuery = gql`
  mutation mutationProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;
