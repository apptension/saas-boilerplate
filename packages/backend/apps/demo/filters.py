import django_filters

from .models import CrudDemoItem


class CrudDemoItemFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    created_at_from = django_filters.CharFilter(field_name="created_at", lookup_expr="gte")
    created_at_to = django_filters.CharFilter(field_name="created_at", lookup_expr="lte")
    updated_at_from = django_filters.CharFilter(field_name="updated_at", lookup_expr="gte")
    updated_at_to = django_filters.CharFilter(field_name="updated_at", lookup_expr="lte")
    order_by = django_filters.OrderingFilter(fields=("name", "category", "created_at", "updated_at"))

    class Meta:
        model = CrudDemoItem
        fields = [
            "name",
            "created_by",
            "created_at",
            "created_at_from",
            "created_at_to",
            "updated_at",
            "updated_at_from",
            "updated_at_to",
        ]
