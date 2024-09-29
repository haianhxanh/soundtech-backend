import { gql } from "graphql-request";

export const tagsRemoveMutation = gql`
  mutation removeTags($id: ID!, $tags: [String!]!) {
    tagsRemove(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        message
      }
    }
  }
`;
