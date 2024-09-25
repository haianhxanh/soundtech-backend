import { gql } from "graphql-request";

export const tagsAddMutation = gql`
  mutation addTags($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        message
      }
    }
  }
`;
