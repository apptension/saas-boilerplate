import { graphQlClient } from '../api/client';

export async function fetchGraphQL(text: string | null | undefined, variables: Record<string, any>) {
  const { data } = await graphQlClient.post('/graphql/', { query: text, variables });
  return data;
}
