import { gql } from "graphql-request";

export const productOptionsCreateQuery = gql`
  mutation createOptions($productId: ID!, $options: [OptionCreateInput!]!) {
    productOptionsCreate(productId: $productId, options: $options) {
      userErrors {
        field
        message
        code
      }
      product {
        id
        variants(first: 5) {
          nodes {
            id
            title
            selectedOptions {
              name
              value
            }
          }
        }
        options {
          id
          name
          values
          position
          optionValues {
            id
            name
            hasVariants
          }
        }
      }
    }
  }
`;
