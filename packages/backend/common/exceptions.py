import inflection


class DomainException(Exception):
    @property
    def code(self):
        return inflection.underscore(self.__class__.__name__)
