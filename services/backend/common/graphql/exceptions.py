from rest_framework.exceptions import ValidationError


class GraphQlValidationError(ValidationError):
    extensions = None

    def __init__(self, detail=None, code=None):
        super(GraphQlValidationError, self).__init__(detail=detail, code=code)
        self.extensions = self.get_full_details()

    def __str__(self):
        return 'GraphQlValidationError'
