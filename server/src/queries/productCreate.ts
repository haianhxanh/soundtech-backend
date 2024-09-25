import { gql } from "graphql-request";

export const productCreateQuery = gql`
  mutation mutationProductCreate(
    $input: ProductInput!
    $media: [CreateMediaInput!]
  ) {
    productCreate(input: $input, media: $media) {
      product {
        id
        title
        variants(first: 20) {
          nodes {
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
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
