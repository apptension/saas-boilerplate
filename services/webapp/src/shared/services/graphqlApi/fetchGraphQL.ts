import { graphQlClient } from '../api/client';
import { apiURL } from '../api/helpers';

export async function fetchGraphQL(text: string | null | undefined, variables: Record<string, unknown>) {
  const { data } = await graphQlClient.post(apiURL('/graphql/'), { query: text, variables });
  return data;
}
