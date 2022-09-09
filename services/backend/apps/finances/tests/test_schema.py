import pytest

pytestmark = pytest.mark.django_db


class TestAllSubscriptionPlansQuery:
    ALL_SUBSCRIPTION_PLANS_QUERY = '''
        query  {
          allSubscriptionPlans {
            edges {
              node {
                pk
                unitAmount
                product {
                  pk
                  name
                }
              }
            }
          }
        }
    '''

    def assert_plan(self, result, price):
        assert result['pk'] == price.id
        assert result['product'] == {'pk': price.product.id, 'name': price.product.name}

    def test_returns_all_items(self, graphene_client, free_plan_price, monthly_plan_price, yearly_plan_price):
        executed = graphene_client.query(self.ALL_SUBSCRIPTION_PLANS_QUERY)

        assert executed["data"]
        assert executed["data"]["allSubscriptionPlans"]
        assert executed["data"]["allSubscriptionPlans"]["edges"]
        self.assert_plan(executed["data"]["allSubscriptionPlans"]["edges"][0]["node"], free_plan_price)
        self.assert_plan(executed["data"]["allSubscriptionPlans"]["edges"][1]["node"], monthly_plan_price)
        self.assert_plan(executed["data"]["allSubscriptionPlans"]["edges"][2]["node"], yearly_plan_price)
