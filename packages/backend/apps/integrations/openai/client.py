import logging

from openai import OpenAI
from config import settings
from .exceptions import OpenAIClientException

logger = logging.getLogger(__name__)


OPEN_AI_API_ERROR_MSG = "OpenAI service is currently unavailable. Please try again in a couple seconds."

# HTTP status codes
HTTP_BAD_REQUEST = 400


class OpenAIClient:
    # Initialize OpenAI client (singleton pattern)
    _client = None

    @classmethod
    def _get_client(cls):
        """Get or create OpenAI client instance."""
        if cls._client is None:
            if not settings.OPENAI_API_KEY:
                raise OpenAIClientException("OpenAI API key is not configured")
            cls._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return cls._client

    @staticmethod
    def get_saas_ideas(keywords: list[str]) -> str:
        """Get SaaS ideas from OpenAI as raw text."""
        keywords_str = ', '.join(keywords)

        # Log the keywords being sent
        logger.info(f"Generating SaaS ideas for keywords: {keywords}")

        # Use chat completions API for better instruction following
        # Try to use a chat model if available, otherwise fall back to completion model
        model = settings.OPENAI_MODEL

        try:
            # If using a completion model, use completions API
            instruct_models = ['instruct', 'davinci', 'curie', 'babbage', 'ada']
            if any(m in model for m in instruct_models):
                # Use completions API for instruct models
                prompt = f"""You are a SaaS product strategist. \
Generate 3-5 creative SaaS product ideas for: {keywords_str}

Format each idea as:

Product Name: [name]
Description: [what it does]
Target Market: [who uses it]
Key Features:
- [feature 1]
- [feature 2]
- [feature 3]
Monetization: [pricing]

Separate ideas with ---"""

                client = OpenAIClient._get_client()
                result = client.completions.create(
                    model=model,
                    prompt=prompt,
                    max_tokens=2000,
                    temperature=0.8,
                )

                if not result.choices or len(result.choices) == 0:
                    raise ValueError("OpenAI API returned no choices in response")

                response_text = result.choices[0].text.strip()

            else:
                # Use chat completions API for chat models (gpt-3.5-turbo, gpt-4, etc.)
                client = OpenAIClient._get_client()
                # Ensure model name is valid
                # Note: gpt-4 may require specific access or different model name
                model_name = model if model.startswith('gpt') else 'gpt-3.5-turbo'

                # If gpt-4 is requested but might not be available, try alternatives
                if model_name == 'gpt-4':
                    # Try common GPT-4 variants if base gpt-4 fails
                    gpt4_variants = ['gpt-4', 'gpt-4-turbo-preview', 'gpt-4-0613', 'gpt-3.5-turbo']
                else:
                    gpt4_variants = [model_name]

                logger.info(f"Using model: {model_name} (requested: {model})")

                last_error = None
                for attempt_model in gpt4_variants:
                    try:
                        logger.info(f"Attempting to use model: {attempt_model}")
                        # Use max_completion_tokens for newer models, max_tokens for older ones
                        # Try max_completion_tokens first (for newer models like o1, gpt-4o, etc.)
                        api_params = {
                            "model": attempt_model,
                            "messages": [
                                {
                                    "role": "system",
                                    "content": (
                                        "You are a SaaS product strategist. Generate creative SaaS "
                                        "product ideas in plain text. Do not write code."
                                    ),
                                },
                                {
                                    "role": "user",
                                    "content": (
                                        f"Generate 3-5 creative SaaS product ideas for: {keywords_str}"
                                        "\n\nFormat each idea as:\n\n"
                                        "Product Name: [name]\n"
                                        "Description: [what it does]\n"
                                        "Target Market: [who uses it]\n"
                                        "Key Features:\n- [feature 1]\n- [feature 2]\n- [feature 3]\n"
                                        "Monetization: [pricing]\n\nSeparate ideas with ---"
                                    ),
                                },
                            ],
                            "temperature": 0.8,
                        }

                        # Try max_completion_tokens first (for newer models like o1, gpt-4o, etc.)
                        # If that fails, fall back to max_tokens (for older models)
                        try:
                            api_params["max_completion_tokens"] = 2000
                            result = client.chat.completions.create(**api_params)
                            logger.info("Successfully used max_completion_tokens parameter")
                        except Exception as param_error:
                            error_str = str(param_error).lower()
                            # If max_completion_tokens is not supported, try max_tokens
                            if (
                                "max_completion_tokens" in error_str
                                or "unsupported_parameter" in error_str
                                or "not supported" in error_str
                            ):
                                logger.info(
                                    f"max_completion_tokens not supported for {attempt_model}, trying max_tokens"
                                )
                                api_params.pop("max_completion_tokens", None)
                                api_params["max_tokens"] = 2000
                                result = client.chat.completions.create(**api_params)
                                logger.info("Successfully used max_tokens parameter")
                            else:
                                # Re-raise if it's a different error
                                raise
                        # Success - break out of retry loop
                        model_name = attempt_model
                        logger.info(f"Successfully using model: {attempt_model}")
                        break
                    except Exception as api_error:
                        last_error = api_error
                        logger.warning(f"Failed to use model {attempt_model}: {api_error}")
                        # If it's not a 400 error (model not found), don't try other models
                        if hasattr(api_error, 'status_code') and api_error.status_code != HTTP_BAD_REQUEST:
                            raise
                        # Continue to next model variant
                        continue
                else:
                    # All models failed
                    logger.error(f"All model attempts failed. Last error: {last_error}")
                    if last_error:
                        raise last_error
                    raise ValueError("Failed to create chat completion with any available model")

                if not result.choices or len(result.choices) == 0:
                    raise ValueError("OpenAI API returned no choices in response")

                response_text = result.choices[0].message.content.strip()

            # Log the raw OpenAI response for debugging
            logger.info(f"OpenAI Raw Response: {response_text}")
            logger.info(f"OpenAI Full Response Length: {len(response_text)} characters")

            if not response_text:
                raise ValueError("OpenAI API returned empty text in response choices")

            return response_text

        except Exception as error:
            # Handle OpenAI API errors (new SDK uses openai.APIError or other exceptions)
            error_type = type(error).__name__
            error_message = str(error)

            # Log detailed error information
            logger.error(f"OpenAI API error: {error_type}")
            logger.error(f"Error message: {error_message}")

            # Try to extract more details from the error
            if hasattr(error, 'response'):
                logger.error(f"Error response: {error.response}")
            if hasattr(error, 'body'):
                logger.error(f"Error body: {error.body}")
            if hasattr(error, 'status_code'):
                logger.error(f"Error status code: {error.status_code}")

            # Check if it's an OpenAI API error
            if 'APIError' in error_type or 'openai' in error_type.lower() or 'rate limit' in error_message.lower():
                # For 400 errors, provide more specific message
                if '400' in error_message or (hasattr(error, 'status_code') and error.status_code == HTTP_BAD_REQUEST):
                    detailed_error = (
                        f"Invalid request to OpenAI API. Check model name and parameters. Error: {error_message}"
                    )
                    logger.error(detailed_error)
                    raise OpenAIClientException(detailed_error) from error
                raise OpenAIClientException(OPEN_AI_API_ERROR_MSG) from error
            # Check if it's a validation error we raised
            if isinstance(error, ValueError):
                raise OpenAIClientException(error_message) from error
            # For any other error, raise generic message
            raise OpenAIClientException(OPEN_AI_API_ERROR_MSG) from error
