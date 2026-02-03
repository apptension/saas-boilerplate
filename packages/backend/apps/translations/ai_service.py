"""
AI-powered translation service using OpenAI.

Provides intelligent batch translation with context awareness
for high-quality machine translations.
"""

import json
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass

from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass
class TranslationResult:
    """Result of a single translation."""

    key: str
    source_text: str
    translated_text: str
    success: bool
    error: Optional[str] = None


class AITranslationService:
    """
    Translates text using OpenAI's API with context awareness.

    Designed for batch processing with:
    - Context passing (key ID, description) for better translations
    - Rate limiting and retry logic
    - Efficient batching to minimize API calls
    """

    # Map locale codes to full language names for better prompts
    LANGUAGE_NAMES = {
        "en": "English",
        "pl": "Polish",
        "de": "German",
        "fr": "French",
        "es": "Spanish",
        "it": "Italian",
        "pt": "Portuguese",
        "nl": "Dutch",
        "ru": "Russian",
        "ja": "Japanese",
        "ko": "Korean",
        "zh": "Chinese (Simplified)",
        "zh-TW": "Chinese (Traditional)",
        "ar": "Arabic",
        "he": "Hebrew",
        "tr": "Turkish",
        "sv": "Swedish",
        "da": "Danish",
        "no": "Norwegian",
        "fi": "Finnish",
        "cs": "Czech",
        "uk": "Ukrainian",
        "ro": "Romanian",
        "hu": "Hungarian",
        "el": "Greek",
        "th": "Thai",
        "vi": "Vietnamese",
        "id": "Indonesian",
        "ms": "Malay",
        "hi": "Hindi",
        "bn": "Bengali",
    }

    def __init__(self):
        self._client = None

    @property
    def client(self):
        """Lazy-load OpenAI client."""
        if self._client is None:
            from openai import OpenAI

            api_key = getattr(settings, "OPENAI_API_KEY", None)
            if not api_key:
                raise ValueError("OPENAI_API_KEY is not configured")

            self._client = OpenAI(api_key=api_key)
        return self._client

    @property
    def model(self) -> str:
        """Get the configured OpenAI model."""
        return getattr(settings, "OPENAI_MODEL", "gpt-4")

    def get_language_name(self, locale_code: str) -> str:
        """Get full language name from locale code."""
        return self.LANGUAGE_NAMES.get(locale_code, locale_code)

    def translate_batch(
        self,
        keys_with_text: List[Dict[str, str]],
        source_locale: str,
        target_locale: str,
        app_context: str = "a modern SaaS web application",
    ) -> List[TranslationResult]:
        """
        Translate a batch of keys using OpenAI.

        Args:
            keys_with_text: List of dicts with 'key', 'text', and optional 'description'
            source_locale: Source locale code (e.g., 'en')
            target_locale: Target locale code (e.g., 'pl')
            app_context: Description of the app for context

        Returns:
            List of TranslationResult objects
        """
        if not keys_with_text:
            return []

        source_lang = self.get_language_name(source_locale)
        target_lang = self.get_language_name(target_locale)

        # Build the prompt with context
        prompt = self._build_translation_prompt(keys_with_text, source_lang, target_lang, app_context)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._get_system_prompt(source_lang, target_lang)},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,  # Lower temperature for consistent translations
                response_format={"type": "json_object"},
            )

            # Parse the response
            content = response.choices[0].message.content
            translations = json.loads(content)

            # Map back to results
            results = []
            translation_map = translations.get("translations", {})

            for item in keys_with_text:
                key = item["key"]
                source_text = item["text"]

                if key in translation_map:
                    results.append(
                        TranslationResult(
                            key=key, source_text=source_text, translated_text=translation_map[key], success=True
                        )
                    )
                else:
                    results.append(
                        TranslationResult(
                            key=key,
                            source_text=source_text,
                            translated_text="",
                            success=False,
                            error="Translation not found in response",
                        )
                    )

            return results

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            return [
                TranslationResult(
                    key=item["key"],
                    source_text=item["text"],
                    translated_text="",
                    success=False,
                    error=f"JSON parse error: {str(e)}",
                )
                for item in keys_with_text
            ]
        except Exception as e:
            logger.error(f"OpenAI translation failed: {e}")
            return [
                TranslationResult(
                    key=item["key"], source_text=item["text"], translated_text="", success=False, error=str(e)
                )
                for item in keys_with_text
            ]

    def translate_single(
        self,
        key: str,
        text: str,
        source_locale: str,
        target_locale: str,
        description: str = "",
        app_context: str = "a modern SaaS web application",
    ) -> TranslationResult:
        """
        Translate a single key.

        For efficiency, prefer translate_batch() when translating multiple keys.
        """
        results = self.translate_batch(
            keys_with_text=[{"key": key, "text": text, "description": description}],
            source_locale=source_locale,
            target_locale=target_locale,
            app_context=app_context,
        )
        return (
            results[0]
            if results
            else TranslationResult(
                key=key, source_text=text, translated_text="", success=False, error="No result returned"
            )
        )

    def _get_system_prompt(self, source_lang: str, target_lang: str) -> str:
        """Generate the system prompt for translation."""
        return f"""You are an expert translator for software user interfaces.
Your task is to translate UI text from {source_lang} to {target_lang}.

IMPORTANT RULES:
1. Preserve all placeholders exactly as they appear (e.g., {{name}}, {{count}}, {{date}})
2. Maintain the tone and formality appropriate for a professional web application
3. Keep translations concise - UI space is often limited
4. Preserve any HTML tags if present
5. Do not translate brand names or technical terms that should remain in English
6. Consider the context provided (key ID and description) for accurate translations
7. Use natural, native-sounding {target_lang} - avoid literal translations

You MUST respond with valid JSON in this exact format:
{{
  "translations": {{
    "key_id_1": "translated text 1",
    "key_id_2": "translated text 2"
  }}
}}"""

    def _build_translation_prompt(
        self, keys_with_text: List[Dict[str, str]], source_lang: str, target_lang: str, app_context: str
    ) -> str:
        """Build the user prompt for batch translation."""
        lines = [
            f"Translate the following UI texts from {source_lang} to {target_lang}.",
            f"These are from {app_context}.",
            "",
            "Texts to translate:",
            "",
        ]

        for item in keys_with_text:
            key = item["key"]
            text = item["text"]
            description = item.get("description", "")

            lines.append(f"Key: {key}")
            lines.append(f"Text: {text}")
            if description:
                lines.append(f"Context: {description}")
            lines.append("")

        lines.append("Respond with JSON containing all translations.")

        return "\n".join(lines)


def is_openai_configured() -> bool:
    """Check if OpenAI API is configured."""
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    return bool(api_key)
