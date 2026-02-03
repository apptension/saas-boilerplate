from dataclasses import dataclass


@dataclass
class SubscriptionPlanPriceConfig:
    unit_amount: int
    currency: str
    recurring: dict


@dataclass
class SubscriptionPlanConfig:
    name: str
    initial_price: SubscriptionPlanPriceConfig


FREE_PLAN = SubscriptionPlanConfig(
    name="free_plan",
    initial_price=SubscriptionPlanPriceConfig(unit_amount=0, currency="usd", recurring={"interval": "month"}),
)
MONTHLY_PLAN = SubscriptionPlanConfig(
    name="monthly_plan",
    initial_price=SubscriptionPlanPriceConfig(unit_amount=10, currency="usd", recurring={"interval": "month"}),
)
YEARLY_PLAN = SubscriptionPlanConfig(
    name="yearly_plan",
    initial_price=SubscriptionPlanPriceConfig(unit_amount=15, currency="usd", recurring={"interval": "year"}),
)

ALL_PLANS = [FREE_PLAN, MONTHLY_PLAN, YEARLY_PLAN]
