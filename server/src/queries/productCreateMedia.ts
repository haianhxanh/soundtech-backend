import { gql } from "graphql-request";

export const productCreateMediaQuery = gql`
  mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
    productCreateMedia(media: $media, productId: $productId) {
      media {
        alt
        mediaContentType
        status
        id
      }
      mediaUserErrors {
        field
        message
      }
      product {
        id
        title
      }
    }
  }
`;
