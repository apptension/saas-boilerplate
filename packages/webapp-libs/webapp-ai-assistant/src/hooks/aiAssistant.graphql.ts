import { gql } from '@sb/webapp-api-client/graphql';

export const aiChatSubscription = gql(/* GraphQL */ `
  subscription AiChatSubscription($conversationId: String!) {
    aiChat(conversationId: $conversationId) {
      event {
        eventType
        message
        toolName
        toolDisplayName
        success
        hasData
        text
        toolsUsed
        conversationId
      }
    }
  }
`);

export const sendAiMessageMutation = gql(/* GraphQL */ `
  mutation SendAiMessageOp(
    $message: String!
    $tenantId: String!
    $conversationId: String!
    $history: [JSONString]
  ) {
    sendAiMessage(
      message: $message
      tenantId: $tenantId
      conversationId: $conversationId
      history: $history
    ) {
      ok
      error
    }
  }
`);
