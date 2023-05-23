from operator import itemgetter

import calleee
from itertools import starmap


class FuzzyDict(calleee.base.BaseMatcher):
    """Matches dicts based on their items.

    To match successfully, the dict needs to:

        * have the keys/values that correspond exactly
          to positional dict

    Examples:
    ```python
    FuzzyDict('foo')  # `foo` attribute with any value
    FuzzyDict('foo', 'bar')  # `foo` and `bar` attributes with any values
    FuzzyDict(foo=42)  # `foo` attribute with value of 42
    FuzzyDict(bar=Integer())  # `bar` attribute whose value is an integer
    FuzzyDict('foo', bar='x')  # `foo` with any value, `bar` with value of 'x'
    ```
    """

    def __init__(self, *args, **kwargs):
        if not (args or kwargs):
            raise TypeError("%s() requires at least one argument" % (self.__class__.__name__,))

        self.attr_names = list(args)
        self.attr_dict = {k: v if isinstance(v, calleee.base.BaseMatcher) else calleee.Eq(v) for k, v in kwargs.items()}

    def match(self, value):
        for name in self.attr_names:
            try:
                value.get(name)
            except KeyError:
                return False

        for name, matcher in self.attr_dict.items():
            # Separately handle retrieving of the attribute value,
            # so that any stray AttributeErrors from the matcher itself
            # are correctly propagated.
            try:
                attrvalue = value.get(name)
            except KeyError:
                return False
            if not matcher.match(attrvalue):
                return False

        return True

    def __repr__(self):
        """Return a representation of the matcher."""
        # get both the names-only and valued attributes and sort them by name
        sentinel = object()
        attrs = [(name, sentinel) for name in self.attr_names] + list(self.attr_dict.items())
        attrs.sort(key=itemgetter(0))

        def attr_repr(name, value):
            # include the value with attribute name whenever necessary
            if value is sentinel:
                return name
            value = value.value if isinstance(value, calleee.Eq) else value
            return "%s=%r" % (name, value)

        return "<%s %s>" % (self.__class__.__name__, " ".join(starmap(attr_repr, attrs)))
