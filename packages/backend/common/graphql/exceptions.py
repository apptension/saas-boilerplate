from rest_framework.exceptions import ValidationError


class GraphQlValidationError(ValidationError):
    def __str__(self):
        return 'GraphQlValidationError'


class GraphQlMutationError(ValidationError):
    def __str__(self):
        return 'GraphQlMutationError'
