from django.contrib.auth import hashers


class DangerousMockHasher(hashers.BasePasswordHasher):
    """
    This is a mock hasher, meant to be used in pytest environment only!
    Never use this pseudo hasher in production environment.

    It doesn't perform any hashing so that creating fixtures is much quicker.
    """

    algorithm = "md5"

    def encode(self, password, salt):
        assert password is not None
        assert salt and "$" not in salt
        return "%s$%s$%s" % (self.algorithm, salt, password)

    def decode(self, encoded):
        algorithm, salt, hash_val = encoded.split("$", 2)
        assert algorithm == self.algorithm
        return {
            "algorithm": algorithm,
            "hash": hash_val,
            "salt": salt,
        }

    def verify(self, password, encoded):
        decoded = self.decode(encoded)
        return decoded["hash"] == password

    def safe_summary(self, encoded):
        decoded = self.decode(encoded)
        return {
            "algorithm": decoded["algorithm"],
            "salt": hashers.mask_hash(decoded["salt"], show=2),
            "hash": hashers.mask_hash(decoded["hash"]),
        }

    def must_update(self, encoded):
        return False

    def harden_runtime(self, password, encoded):
        """Defined as a no-op to silence the super() class warning"""
