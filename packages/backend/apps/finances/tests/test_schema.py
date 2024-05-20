from datetime import timedelta
import pytest
import calleee
from djstripe import models as djstripe_models
from graphql_relay import to_global_id, from_global_id
from apps.finances.tests.utils import stripe_encode
from django.utils import timezone

from apps.multitenancy.constants import TenantUserRole

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


class TestActiveSubscriptionQuery:
    ACTIVE_SUBSCRIPTION_QUERY = '''
        query($tenantId: ID) {
          activeSubscription(tenantId: $tenantId) {
            subscription {
              pk
              status
              trialStart
              trialEnd
              plan {
                pk
              }
            }
            phases {
              startDate
              endDate
              trialEnd
              item {
                quantity
                price {
                  pk
                  unitAmount
                  product {
                    pk
                    name
                  }
                }
              }
            }
            canActivateTrial
            defaultPaymentMethod {
              pk
              type
              card
              billingDetails
            }
          }
        }
    '''

    def assert_response(self, response, schedule):
        subscription = schedule.customer.subscription

        assert response['subscription']['pk'] == subscription.id
        assert response['subscription']['status'].lower() == subscription.status
        subscription_plan = subscription.plan
        if subscription_plan:
            assert response['subscription']['plan']['pk'] == subscription_plan.id
        else:
            assert response['subscription']['plan'] is None

        default_payment_method = schedule.customer.default_payment_method
        if default_payment_method:
            assert response['defaultPaymentMethod']['pk'] == default_payment_method.id
        else:
            assert response['defaultPaymentMethod'] is None

        assert len(response['phases']) > 0
        for index, response_phase in enumerate(response['phases']):
            phase = schedule.phases[index]
            item = phase['items'][0]
            price = djstripe_models.Price.objects.get(id=item['price'])

            assert response_phase['item'] == {
                'quantity': item['quantity'],
                'price': {
                    'pk': price.id,
                    'unitAmount': price.unit_amount,
                    'product': {'pk': price.product.id, 'name': price.product.name},
                },
            }

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        executed = graphene_client.query(
            self.ACTIVE_SUBSCRIPTION_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_error_for_admin_user(
        self,
        graphene_client,
        subscription_schedule_factory,
        monthly_plan_price,
        user_factory,
        tenant_membership_factory,
    ):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        customer = subscription_schedule.customer
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.query(
            self.ACTIVE_SUBSCRIPTION_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_trial_fields_in_response_when_customer_already_activated_trial(
        self,
        graphene_client,
        subscription_schedule_factory,
        monthly_plan_price,
        user_factory,
        tenant_membership_factory,
    ):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        customer = subscription_schedule.customer
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        executed = graphene_client.query(
            self.ACTIVE_SUBSCRIPTION_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed['data']['activeSubscription']['phases'][0]['trialEnd']
        assert executed['data']['activeSubscription']['subscription']['trialStart']
        assert executed['data']['activeSubscription']['subscription']['trialEnd']
        assert not executed['data']['activeSubscription']['canActivateTrial']

    def test_trial_fields_in_response_when_user_never_activated_it(
        self, graphene_client, subscription_schedule, user_factory, tenant_membership_factory
    ):
        tenant = subscription_schedule.customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        executed = graphene_client.query(
            self.ACTIVE_SUBSCRIPTION_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        response_phase = executed['data']['activeSubscription']['phases'][0]
        assert not response_phase['trialEnd']
        assert executed['data']['activeSubscription']['canActivateTrial']

    def test_return_active_subscription_data(
        self, graphene_client, subscription_schedule, user_factory, tenant_membership_factory
    ):
        tenant = subscription_schedule.customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        executed = graphene_client.query(
            self.ACTIVE_SUBSCRIPTION_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )
        print(executed)

        self.assert_response(executed['data']['activeSubscription'], subscription_schedule)


class TestChangeActiveSubscriptionMutation:
    CHANGE_ACTIVE_SUBSCRIPTION_MUTATION = '''
        mutation($input: ChangeActiveSubscriptionMutationInput!)  {
          changeActiveSubscription(input: $input) {
            subscriptionSchedule {
              subscription {
                pk
                status
                trialStart
                trialEnd
              }
              phases {
                startDate
                endDate
                trialEnd
                item {
                  quantity
                  price {
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
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_change_active_subscription_by_admin(
        self, graphene_client, subscription_schedule, monthly_plan_price, user_factory, tenant_membership_factory
    ):
        tenant = subscription_schedule.customer.subscriber
        input_data = {'price': monthly_plan_price.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)

        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_change_active_subscription(
        self, graphene_client, subscription_schedule, monthly_plan_price, user_factory, tenant_membership_factory
    ):
        tenant = subscription_schedule.customer.subscriber
        input_data = {'price': monthly_plan_price.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed['data']
        assert "errors" not in executed

    def test_change_when_user_has_no_payment_method_but_can_activate_trial(
        self,
        graphene_client,
        customer_factory,
        subscription_schedule_factory,
        free_plan_price,
        monthly_plan_price,
        user_factory,
        tenant_membership_factory,
    ):
        customer = customer_factory(default_payment_method=None)
        tenant = customer.subscriber
        input_data = {'price': monthly_plan_price.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        subscription_schedule_factory(customer=customer, phases=[{'items': [{'price': free_plan_price.id}]}])
        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed['data']
        assert "errors" not in executed

    def test_return_error_on_change_if_customer_has_no_payment_method(
        self,
        graphene_client,
        customer_factory,
        monthly_plan_price,
        subscription_schedule_factory,
        user_factory,
        tenant_membership_factory,
    ):
        customer = customer_factory(default_payment_method=None)
        tenant = customer.subscriber
        input_data = {'price': monthly_plan_price.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        subscription_schedule_factory(
            customer=customer, phases=[{'items': [{'price': monthly_plan_price.id}], 'trial_completed': True}]
        )
        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input_data},
        )

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["changeActiveSubscription"]
        assert error["extensions"]["non_field_errors"] == [
            {'message': 'Customer has no payment method setup', 'code': 'missing_payment_method'}
        ]


class TestCancelActiveSubscriptionMutation:
    CANCEL_ACTIVE_SUBSCRIPTION_MUTATION = '''
        mutation($input: CancelActiveSubscriptionMutationInput!)  {
          cancelActiveSubscription(input: $input) {
            subscriptionSchedule {
              id
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_error_if_customer_has_no_paid_subscription(
        self, graphene_client, subscription_schedule, user_factory, tenant_membership_factory
    ):
        tenant = subscription_schedule.customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["cancelActiveSubscription"]
        assert error["extensions"]["non_field_errors"] == [
            {'message': 'Customer has no paid subscription to cancel', 'code': 'no_paid_subscription'}
        ]

    def test_cancel_trialing_subscription_by_admin(
        self,
        graphene_client,
        subscription_schedule_factory,
        monthly_plan_price,
        user_factory,
        tenant_membership_factory,
    ):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        tenant = subscription_schedule.customer.subscriber
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)

        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_cancel_trialing_subscription(
        self,
        graphene_client,
        subscription_schedule_factory,
        monthly_plan_price,
        user_factory,
        tenant_membership_factory,
    ):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        tenant = subscription_schedule.customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed['data']
        assert "errors" not in executed


class TestAllPaymentMethodsQuery:
    ALL_PAYMENT_METHODS_QUERY = '''
        query($tenantId: ID)  {
          allPaymentMethods(tenantId: $tenantId) {
            edges {
              node {
                pk
              }
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        executed = graphene_client.query(
            self.ALL_PAYMENT_METHODS_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_only_customer_payment_methods_by_admin(
        self, graphene_client, customer, payment_method_factory, user_factory, tenant_membership_factory
    ):
        payment_method_factory(customer=customer)
        payment_method_factory()
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.query(
            self.ALL_PAYMENT_METHODS_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_only_customer_payment_methods(
        self, graphene_client, customer, payment_method_factory, user_factory, tenant_membership_factory
    ):
        payment_method = payment_method_factory(customer=customer)
        other_customer_payment_method = payment_method_factory()
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.query(
            self.ALL_PAYMENT_METHODS_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["data"]
        assert executed["data"]["allPaymentMethods"]
        assert executed["data"]["allPaymentMethods"]["edges"]
        assert len(executed["data"]["allPaymentMethods"]["edges"]) == 1

        charge_ids = [charge["node"]["pk"] for charge in executed["data"]["allPaymentMethods"]["edges"]]
        customer.refresh_from_db()
        assert payment_method.id in charge_ids
        assert other_customer_payment_method.id not in charge_ids


class TestUpdateDefaultPaymentMethodMutation:
    UPDATE_DEFAULT_PAYMENT_METHOD_MUTATION = '''
        mutation($input: UpdateDefaultPaymentMethodMutationInput!)  {
          updateDefaultPaymentMethod(input: $input) {
            paymentMethodEdge {
              node {
                pk
              }
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        executed = graphene_client.mutate(
            self.UPDATE_DEFAULT_PAYMENT_METHOD_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_fetch_unknown_payment_method_from_stripe(
        self, graphene_client, stripe_request, payment_method_factory, user_factory, tenant_membership_factory
    ):
        other_users_pm = payment_method_factory()
        payment_method = payment_method_factory()
        tenant = payment_method.customer.subscriber
        input_data = {"id": other_users_pm.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.UPDATE_DEFAULT_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "No PaymentMethod matches the given query."
        stripe_request.assert_any_call(
            'get', calleee.EndsWith(f'/payment_methods/{other_users_pm.id}'), calleee.Any(), None
        )

    def test_set_default_payment_method_by_admin(
        self, graphene_client, payment_method_factory, customer, user_factory, tenant_membership_factory
    ):
        payment_method = payment_method_factory(customer=customer)
        tenant = payment_method.customer.subscriber
        input_data = {"id": payment_method.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.mutate(
            self.UPDATE_DEFAULT_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_set_default_payment_method(
        self, graphene_client, payment_method_factory, customer, stripe_request, user_factory, tenant_membership_factory
    ):
        payment_method = payment_method_factory(customer=customer)
        tenant = payment_method.customer.subscriber
        input_data = {"id": payment_method.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.UPDATE_DEFAULT_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["data"]
        assert executed["data"]["updateDefaultPaymentMethod"]
        assert executed["data"]["updateDefaultPaymentMethod"]["paymentMethodEdge"]
        assert executed["data"]["updateDefaultPaymentMethod"]["paymentMethodEdge"]["node"]
        assert executed["data"]["updateDefaultPaymentMethod"]["paymentMethodEdge"]["node"]["pk"] == payment_method.id
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'/customers/{customer.id}'),
            calleee.Any(),
            stripe_encode({'invoice_settings': {'default_payment_method': payment_method.id}}),
        )


class TestDeletePaymentMethodMutation:
    DELETE_PAYMENT_METHOD_MUTATION = '''
        mutation($input: DeletePaymentMethodMutationInput!)  {
          deletePaymentMethod(input: $input) {
            deletedIds
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_other_users_payment_method(
        self, graphene_client, stripe_request, payment_method_factory, user_factory, tenant_membership_factory
    ):
        other_users_pm = payment_method_factory()
        payment_method = payment_method_factory()
        tenant = payment_method.customer.subscriber
        input_data = {"id": other_users_pm.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.DELETE_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "No PaymentMethod matches the given query."
        stripe_request.assert_any_call(
            'get', calleee.EndsWith(f'/payment_methods/{other_users_pm.id}'), calleee.Any(), None
        )

    def test_detach_payment_method_by_admin(
        self, graphene_client, payment_method, user_factory, tenant_membership_factory
    ):
        tenant = payment_method.customer.subscriber
        input_data = {"id": payment_method.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.mutate(
            self.DELETE_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_detach_payment_method(
        self, graphene_client, stripe_request, payment_method, user_factory, tenant_membership_factory
    ):
        customer = payment_method.customer
        payment_method_global_id = to_global_id('StripePaymentMethodType', str(payment_method.djstripe_id))
        tenant = payment_method.customer.subscriber
        input_data = {"id": payment_method.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.DELETE_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        customer.refresh_from_db()
        assert executed == {'data': {'deletePaymentMethod': {'deletedIds': [payment_method_global_id]}}}
        assert customer.default_payment_method is None
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'payment_methods/{payment_method.id}/detach'),
            calleee.Any(),
            '',
        )

    def test_set_default_payment_method_to_next_one(
        self, graphene_client, stripe_request, customer, payment_method_factory, user_factory, tenant_membership_factory
    ):
        payment_method = payment_method_factory(customer=customer)
        customer.default_payment_method = payment_method
        customer.save()
        other_payment_method = payment_method_factory(customer=customer)
        tenant = payment_method.customer.subscriber
        input_data = {"id": payment_method.id, "tenantId": to_global_id("TenantType", tenant.pk)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.DELETE_PAYMENT_METHOD_MUTATION,
            variable_values={'input': input_data},
        )

        customer.refresh_from_db()

        assert executed["data"]
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'payment_methods/{payment_method.id}/detach'),
            calleee.Any(),
            '',
        )
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'/customers/{customer.id}'),
            calleee.Any(),
            stripe_encode({'invoice_settings': {'default_payment_method': other_payment_method.id}}),
        )


class TestAllChargesQuery:
    ALL_CHARGES_QUERY = '''
        query($tenantId: ID)  {
          allCharges(tenantId: $tenantId) {
            edges {
              node {
                pk
              }
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        executed = graphene_client.query(
            self.ALL_CHARGES_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_only_customer_charges_by_admin(
        self, graphene_client, customer, user_factory, tenant_membership_factory
    ):
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.query(
            self.ALL_CHARGES_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_only_customer_charges(
        self, graphene_client, customer, charge_factory, user_factory, tenant_membership_factory
    ):
        other_customer_charge = charge_factory()
        regular_charge = charge_factory(customer=customer)
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.query(
            self.ALL_CHARGES_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["data"]
        assert executed["data"]["allCharges"]
        assert executed["data"]["allCharges"]["edges"]
        assert len(executed["data"]["allCharges"]["edges"]) == 1

        charge_ids = [charge["node"]["pk"] for charge in executed["data"]["allCharges"]["edges"]]
        assert regular_charge.id in charge_ids
        assert other_customer_charge.id not in charge_ids

    def test_return_charges_ordered_by_creation_date_descending(
        self, graphene_client, customer, charge_factory, user_factory, tenant_membership_factory
    ):
        old_charge = charge_factory(customer=customer, created=timezone.now() - timedelta(days=1))
        oldest_charge = charge_factory(customer=customer, created=timezone.now() - timedelta(days=2))
        new_charge = charge_factory(customer=customer, created=timezone.now())
        tenant = customer.subscriber
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.query(
            self.ALL_CHARGES_QUERY, variable_values={"tenantId": to_global_id("TenantType", tenant.id)}
        )

        assert executed["data"]
        assert executed["data"]["allCharges"]
        assert executed["data"]["allCharges"]["edges"]
        assert len(executed["data"]["allCharges"]["edges"]) == 3

        charge_ids = [charge["node"]["pk"] for charge in executed["data"]["allCharges"]["edges"]]
        assert charge_ids == [new_charge.id, old_charge.id, oldest_charge.id]


class TestChargeQuery:
    CHARGE_QUERY = '''
        query getCharge($id: ID!, $tenantId: ID) {
          charge(id: $id, tenantId: $tenantId) {
            id
            amount
            billingDetails
            currency
            captured
            created
            paid
            paymentMethodDetails
            status
            invoice {
              id
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, customer, charge_factory, tenant):
        charge = charge_factory(customer=customer)

        variable_values = {
            "id": to_global_id('StripeChargeType', str(charge.pk)),
            "tenantId": to_global_id("TenantType", tenant.id),
        }
        executed = graphene_client.query(self.CHARGE_QUERY, variable_values=variable_values)

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_charge_by_admin(
        self, graphene_client, customer, charge_factory, user_factory, tenant_membership_factory
    ):
        charge = charge_factory(customer=customer)
        charge_global_id = to_global_id('StripeChargeType', str(charge.pk))
        tenant = customer.subscriber
        variable_values = {"id": charge_global_id, "tenantId": to_global_id("TenantType", tenant.id)}
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.query(self.CHARGE_QUERY, variable_values=variable_values)

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_charge(self, graphene_client, customer, charge_factory, user_factory, tenant_membership_factory):
        charge = charge_factory(customer=customer)
        charge_global_id = to_global_id('StripeChargeType', str(charge.pk))
        tenant = customer.subscriber
        variable_values = {"id": charge_global_id, "tenantId": to_global_id("TenantType", tenant.id)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.query(self.CHARGE_QUERY, variable_values=variable_values)

        assert executed["data"]
        assert executed["data"]["charge"]
        assert executed["data"]["charge"] == {
            "id": charge_global_id,
            "amount": f"{charge.amount:.2f}",
            "billingDetails": {
                "address": {
                    "city": None,
                    "country": None,
                    "line1": None,
                    "line2": None,
                    "postal_code": charge.billing_details["address"]["postal_code"],
                    "state": None,
                },
                "email": None,
                "name": charge.billing_details["name"],
                "phone": None,
            },
            "currency": "usd",
            "captured": True,
            "created": None,
            "paid": False,
            "paymentMethodDetails": None,
            "status": "SUCCEEDED",
            "invoice": None,
        }


class TestPaymentIntentQuery:
    PAYMENT_INTENT_QUERY = '''
        query getPaymentIntent($id: ID!, $tenantId: ID) {
          paymentIntent(id: $id, tenantId: $tenantId) {
            id
            amount
            currency
            clientSecret
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, customer, payment_intent_factory, tenant):
        payment_intent = payment_intent_factory(customer=customer)

        variable_values = {
            "id": to_global_id('StripePaymentIntentType', str(payment_intent.pk)),
            "tenantId": to_global_id("TenantType", tenant.id),
        }
        executed = graphene_client.query(self.PAYMENT_INTENT_QUERY, variable_values=variable_values)

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_error_if_not_users_payment_intent(
        self, graphene_client, customer, payment_intent_factory, user_factory, tenant_membership_factory
    ):
        payment_intent = payment_intent_factory()
        payment_intent_global_id = to_global_id('StripePaymentIntentType', str(payment_intent.pk))
        tenant = customer.subscriber
        variable_values = {"id": payment_intent_global_id, "tenantId": to_global_id("TenantType", tenant.id)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.query(self.PAYMENT_INTENT_QUERY, variable_values=variable_values)

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "PaymentIntent matching query does not exist."

    def test_return_payment_intent_by_admin(
        self, graphene_client, customer, payment_intent_factory, user_factory, tenant_membership_factory
    ):
        payment_intent = payment_intent_factory(customer=customer)
        payment_intent_global_id = to_global_id('StripePaymentIntentType', str(payment_intent.pk))
        tenant = customer.subscriber
        variable_values = {"id": payment_intent_global_id, "tenantId": to_global_id("TenantType", tenant.id)}
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.query(self.PAYMENT_INTENT_QUERY, variable_values=variable_values)

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_payment_intent(
        self, graphene_client, customer, payment_intent_factory, user_factory, tenant_membership_factory
    ):
        payment_intent = payment_intent_factory(customer=customer)
        payment_intent_global_id = to_global_id('StripePaymentIntentType', str(payment_intent.pk))
        tenant = customer.subscriber
        variable_values = {"id": payment_intent_global_id, "tenantId": to_global_id("TenantType", tenant.id)}
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.query(self.PAYMENT_INTENT_QUERY, variable_values=variable_values)

        assert executed["data"]
        assert executed["data"]["paymentIntent"]
        assert executed["data"]["paymentIntent"] == {
            "id": payment_intent_global_id,
            "amount": payment_intent.amount,
            "currency": "usd",
            "clientSecret": payment_intent.client_secret,
        }


class TestCreatePaymentIntentMutation:
    CREATE_PAYMENT_INTENT_MUTATION = '''
        mutation($input: CreatePaymentIntentMutationInput!)  {
          createPaymentIntent(input: $input) {
            paymentIntent {
              id
              amount
              currency
              clientSecret
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        input_data = {"product": "A", "tenantId": to_global_id("TenantType", tenant.pk)}

        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_error_if_product_is_not_passed(
        self, graphene_client, user_factory, tenant, tenant_membership_factory
    ):
        input_data = {"tenantId": to_global_id("TenantType", tenant.pk)}

        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert "Field 'product' of required type 'String!' was not provided." in executed["errors"][0]["message"]

    def test_return_error_if_product_does_not_exist(
        self, graphene_client, user_factory, tenant, tenant_membership_factory
    ):
        input_data = {"product": "A", "tenantId": to_global_id("TenantType", tenant.pk)}

        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["createPaymentIntent"]
        assert error["extensions"]["product"] == [{'message': '"A" is not a valid choice.', 'code': 'invalid_choice'}]

    def test_creates_payment_intent_by_admin(self, graphene_client, user_factory, tenant, tenant_membership_factory):
        input_data = {"product": "5", "tenantId": to_global_id("TenantType", tenant.pk)}

        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_creates_payment_intent(self, graphene_client, user_factory, tenant, tenant_membership_factory):
        input_data = {"product": "5", "tenantId": to_global_id("TenantType", tenant.pk)}

        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed['data']['createPaymentIntent']
        assert executed['data']['createPaymentIntent']['paymentIntent']

        payment_intent_global_id = executed['data']['createPaymentIntent']['paymentIntent']['id']
        _, pk = from_global_id(payment_intent_global_id)
        payment_intent = djstripe_models.PaymentIntent.objects.get(pk=pk)

        assert executed['data']['createPaymentIntent']['paymentIntent']['amount'] == 500
        assert executed['data']['createPaymentIntent']['paymentIntent']['currency'] == "usd"
        assert executed['data']['createPaymentIntent']['paymentIntent']['clientSecret'] == payment_intent.client_secret


class TestUpdatePaymentIntentMutation:
    UPDATE_PAYMENT_INTENT_MUTATION = '''
        mutation($input: UpdatePaymentIntentMutationInput!)  {
          updatePaymentIntent(input: $input) {
            paymentIntent {
              id
              amount
              currency
              clientSecret
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, payment_intent_factory, tenant):
        payment_intent = payment_intent_factory(amount=50)
        input_data = {
            "id": to_global_id('StripePaymentIntentType', str(payment_intent.pk)),
            "product": "10",
            "tenantId": to_global_id("TenantType", tenant.pk),
        }

        executed = graphene_client.mutate(
            self.UPDATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_error_if_product_belongs_to_other_user(
        self, graphene_client, payment_intent_factory, customer, user_factory, tenant_membership_factory
    ):
        payment_intent = payment_intent_factory(amount=50)
        tenant = customer.subscriber
        input_data = {
            "id": to_global_id('StripePaymentIntentType', str(payment_intent.pk)),
            "product": "10",
            "tenantId": to_global_id("TenantType", tenant.pk),
        }
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.UPDATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "No PaymentIntent matches the given query."

    def test_update_payment_intent_amount_by_admin(
        self, graphene_client, payment_intent_factory, customer, user_factory, tenant_membership_factory
    ):
        payment_intent = payment_intent_factory(amount=50, customer=customer)
        tenant = customer.subscriber
        input_data = {
            "id": to_global_id('StripePaymentIntentType', str(payment_intent.pk)),
            "product": "10",
            "tenantId": to_global_id("TenantType", tenant.pk),
        }
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.mutate(
            self.UPDATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_update_payment_intent_amount(
        self, graphene_client, payment_intent_factory, customer, user_factory, tenant_membership_factory
    ):
        payment_intent = payment_intent_factory(amount=50, customer=customer)
        tenant = customer.subscriber
        input_data = {
            "id": to_global_id('StripePaymentIntentType', str(payment_intent.pk)),
            "product": "10",
            "tenantId": to_global_id("TenantType", tenant.pk),
        }
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.UPDATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': input_data},
        )

        assert executed["data"]
        assert executed['data']['updatePaymentIntent']['paymentIntent']
        assert executed['data']['updatePaymentIntent']['paymentIntent']['amount'] == 1000

        payment_intent.refresh_from_db()
        assert payment_intent.amount == 1000


class TestCreateSetupIntentMutation:
    CREATE_PAYMENT_INTENT_MUTATION = '''
        mutation($input: CreateSetupIntentMutationInput!)  {
          createSetupIntent(input: $input) {
            setupIntent {
              id
              clientSecret
            }
          }
        }
    '''

    @staticmethod
    def _get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory, role=TenantUserRole.OWNER):
        user = user_factory()
        tenant_membership_factory(tenant=tenant, role=role, user=user)
        return user

    def test_return_error_for_unauthorized_user(self, graphene_client, tenant):
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_creates_payment_intent_by_admin(self, graphene_client, user_factory, tenant, tenant_membership_factory):
        user = self._get_user_from_customer_tenant(
            tenant, user_factory, tenant_membership_factory, TenantUserRole.ADMIN
        )

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_creates_payment_intent(self, graphene_client, user_factory, tenant, tenant_membership_factory):
        user = self._get_user_from_customer_tenant(tenant, user_factory, tenant_membership_factory)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = graphene_client.mutate(
            self.CREATE_PAYMENT_INTENT_MUTATION,
            variable_values={'input': {"tenantId": to_global_id("TenantType", tenant.pk)}},
        )

        assert executed['data']['createSetupIntent']
        assert executed['data']['createSetupIntent']['setupIntent']

        setup_intent_global_id = executed['data']['createSetupIntent']['setupIntent']['id']
        _, pk = from_global_id(setup_intent_global_id)
        setup_intent = djstripe_models.SetupIntent.objects.get(pk=pk)

        assert executed['data']['createSetupIntent']['setupIntent']['clientSecret'] == setup_intent.client_secret
