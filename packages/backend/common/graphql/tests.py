"""
GraphQL testing utilities.
"""

import json
from django.test import TestCase, Client


class GraphQLTestCase(TestCase):
    """
    Base test case class for GraphQL tests.

    Provides helper methods for executing GraphQL queries and mutations.
    """

    GRAPHQL_URL = "/api/graphql/"

    def setUp(self):
        super().setUp()
        self.client = Client()

    def execute(self, query, variables=None, operation_name=None):
        """
        Execute a GraphQL query/mutation.

        Args:
            query: The GraphQL query string
            variables: Optional dict of variables
            operation_name: Optional operation name

        Returns:
            The parsed JSON response
        """
        body = {"query": query}

        if variables:
            body["variables"] = variables

        if operation_name:
            body["operationName"] = operation_name

        response = self.client.post(
            self.GRAPHQL_URL,
            data=json.dumps(body),
            content_type="application/json",
        )

        return json.loads(response.content)

    def execute_with_errors(self, query, variables=None):
        """
        Execute a query and assert it contains errors.

        Args:
            query: The GraphQL query string
            variables: Optional dict of variables

        Returns:
            The errors from the response
        """
        response = self.execute(query, variables)
        self.assertIn("errors", response)
        return response["errors"]

    def execute_without_errors(self, query, variables=None):
        """
        Execute a query and assert it does not contain errors.

        Args:
            query: The GraphQL query string
            variables: Optional dict of variables

        Returns:
            The data from the response
        """
        response = self.execute(query, variables)
        self.assertNotIn("errors", response, f"Expected no errors but got: {response.get('errors')}")
        return response["data"]

    def login_user(self, user):
        """
        Log in a user for subsequent requests.

        Args:
            user: The user instance to log in
        """
        self.client.force_login(user)

    def logout(self):
        """Log out the current user."""
        self.client.logout()
