from pytest_factoryboy import named_model

import factory


class OpenAIResponseFactory(factory.DictFactory):
    id = factory.Faker("pystr")
    object = factory.Faker("word")
    created = factory.Faker("pyint")
    usage = factory.Dict(
        {
            "prompt_tokens": factory.Faker("pyint"),
            "completion_tokens": factory.Faker("pyint"),
            "total_tokens": factory.Faker("pyint"),
        }
    )

    class Meta:
        abstract = True


class OpenAICompletionResponseChoiceFactory(factory.DictFactory):
    text = factory.Faker("sentence")
    index = factory.Sequence(lambda n: n)
    logprobs = None
    finish_reason = "length"

    class Meta:
        model = named_model(dict, "OpenAICompletionResponseChoice")


class OpenAICompletionResponseFactory(OpenAIResponseFactory):
    model = factory.Faker('random_element', elements=["text-babbage-001", "text-davinci-003", "text-ada-001"])
    choices = factory.List([factory.SubFactory(OpenAICompletionResponseChoiceFactory)])

    class Meta:
        model = named_model(dict, "OpenAICompletionResponse")
