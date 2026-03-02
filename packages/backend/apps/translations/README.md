# Dynamic Translations System

This Django app provides runtime-managed translations with admin panel management, CDN delivery, version history, and AI-powered translation.

## Quick Reference

### Models

| Model                | Description                        |
| -------------------- | ---------------------------------- |
| `Locale`             | Supported languages (en, pl, etc.) |
| `TranslationKey`     | Message IDs from codebase          |
| `Translation`        | Translated text per locale         |
| `TranslationVersion` | Published version history          |
| `AITranslationJob`   | Async AI translation job tracking  |

### Services

| Service                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `TranslationPublisher` | Generates JSON bundles, uploads to S3, invalidates CDN |
| `TranslationSyncer`    | Syncs keys from extracted JSON to database             |
| `AITranslationService` | Batch translation using OpenAI                         |

### Management Commands

```bash
# Sync keys from JSON file
python manage.py sync_translations path/to/master.json

# Dry run (see what would change without making changes)
python manage.py sync_translations path/to/master.json --dry-run

# Publish translations to CDN
python manage.py publish_translations en
python manage.py publish_translations --all
```

### Automatic Sync on Startup

When running locally with `pnpm saas up`, the backend automatically syncs translation keys 
from `packages/webapp-libs/webapp-core/src/translations/master.json` on startup (if the file exists).

### Environment Variables

```bash
TRANSLATIONS_BUCKET_NAME=my-project-translations
TRANSLATIONS_CLOUDFRONT_ID=ABCD1234567890

# For AI translation
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4
```

### API Endpoints

| Method | Endpoint                  | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| POST   | `/api/translations/sync/` | Sync keys from frontend build (admin)  |

> **Note**: For local development, prefer using the management command via docker exec 
> (which is what `pnpm translations:sync` does by default) as it doesn't require authentication.

### AI Translation (Admin)

1. Go to Admin → Locales
2. Click **🤖 AI Translate**
3. Select source/target locales
4. Monitor in AI Translation Jobs

## Documentation

For complete documentation, see:

- **[Feature Overview](https://apptension.github.io/saas-boilerplate/introduction/features/translations)** - Architecture and concepts
- **[Manage Translations](https://apptension.github.io/saas-boilerplate/working-with-sb/translations/manage-translations)** - Step-by-step workflow
- **[Add a Language](https://apptension.github.io/saas-boilerplate/working-with-sb/translations/add-language)** - Add new locales
- **[AI Translation](https://apptension.github.io/saas-boilerplate/working-with-sb/translations/ai-translate)** - OpenAI-powered translation
