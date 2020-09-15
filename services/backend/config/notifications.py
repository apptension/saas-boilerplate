import random


def stdout(*args, **kwargs):
    look_at_me = ["🍿", "🍉", "🌯", "🍔"]
    print(random.choice(look_at_me), *args, kwargs)
