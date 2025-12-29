"""
Django admin configuration for translation management.

Provides a user-friendly interface for managing translations, including:
- Viewing and searching translation keys
- Creating and editing translations for each locale
- Publishing translations to S3/CDN
- Version history and rollback
- AI-powered batch translation
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import path, reverse
from django.http import HttpResponseRedirect
from django.contrib import messages
from django import forms
from django.shortcuts import render

from .models import TranslationKey, Locale, Translation, TranslationVersion, AITranslationJob
from .services import TranslationPublisher, TranslationSyncer
from .ai_service import is_openai_configured


class TranslationInlineForm(forms.ModelForm):
    """Custom form for translation inline with larger text area."""

    class Meta:
        model = Translation
        fields = ['locale', 'value', 'status']
        widgets = {
            'value': forms.Textarea(attrs={'rows': 2, 'cols': 80}),
        }


class TranslationInline(admin.TabularInline):
    """Inline editor for translations within a translation key."""

    model = Translation
    form = TranslationInlineForm
    extra = 0
    fields = ['locale', 'value', 'status', 'translated_by', 'updated_at']
    readonly_fields = ['translated_by', 'updated_at']
    ordering = ['locale__sort_order', 'locale__code']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "locale":
            kwargs["queryset"] = Locale.objects.filter(is_active=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if not change or not obj.translated_by:
            obj.translated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TranslationKey)
class TranslationKeyAdmin(admin.ModelAdmin):
    """Admin interface for translation keys."""

    list_display = ['key_display', 'truncated_default', 'translation_status', 'is_deprecated', 'last_seen_at']
    list_filter = ['is_deprecated', 'first_seen_at', 'last_seen_at']
    search_fields = ['key', 'default_message', 'description']
    readonly_fields = ['key', 'default_message', 'source_file', 'first_seen_at', 'last_seen_at']
    inlines = [TranslationInline]
    list_per_page = 50

    fieldsets = (
        ('Key Information', {'fields': ('key', 'default_message', 'description')}),
        (
            'Metadata',
            {'fields': ('source_file', 'is_deprecated', 'first_seen_at', 'last_seen_at'), 'classes': ('collapse',)},
        ),
    )

    def key_display(self, obj):
        """Display key with deprecation styling."""
        if obj.is_deprecated:
            return format_html('<span style="color: #999; text-decoration: line-through;">{}</span>', obj.key)
        return obj.key

    key_display.short_description = 'Key'
    key_display.admin_order_field = 'key'

    def truncated_default(self, obj):
        """Display truncated default message."""
        max_len = 60
        if len(obj.default_message) > max_len:
            return f"{obj.default_message[:max_len]}..."
        return obj.default_message

    truncated_default.short_description = 'Default Message'

    def translation_status(self, obj):
        """Display translation completion status with visual indicator."""
        active_locales = Locale.objects.filter(is_active=True).count()
        published = obj.translations.filter(status=Translation.Status.PUBLISHED).count()

        if published == 0:
            color = '#dc3545'  # Red
            icon = '○'
        elif published < active_locales:
            color = '#ffc107'  # Yellow
            icon = '◐'
        else:
            color = '#28a745'  # Green
            icon = '●'

        return format_html(
            '<span style="color: {}; font-size: 16px;" title="{} of {} locales">{}</span> '
            '<span style="color: #666;">{}/{}</span>',
            color,
            published,
            active_locales,
            icon,
            published,
            active_locales,
        )

    translation_status.short_description = 'Translations'

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('translations')


class AITranslationForm(forms.Form):
    """Form for configuring AI translation job."""

    source_locale = forms.ModelChoiceField(
        queryset=Locale.objects.filter(is_active=True),
        label="Translate from",
        help_text="Source language to translate from (usually English)",
    )
    target_locale = forms.ModelChoiceField(
        queryset=Locale.objects.filter(is_active=True),
        label="Translate to",
        help_text="Target language to translate to",
    )
    overwrite_existing = forms.BooleanField(
        required=False,
        initial=False,
        label="Overwrite existing translations",
        help_text="If checked, will re-translate keys that already have translations",
    )
    auto_publish = forms.BooleanField(
        required=False,
        initial=False,
        label="Auto-publish translations",
        help_text="If checked, translations will be set to Published status",
    )
    batch_size = forms.IntegerField(
        initial=20,
        min_value=1,
        max_value=50,
        label="Batch size",
        help_text="Number of keys to translate per API call (1-50)",
    )

    def clean(self):
        cleaned_data = super().clean()
        source = cleaned_data.get('source_locale')
        target = cleaned_data.get('target_locale')

        if source and target and source == target:
            raise forms.ValidationError("Source and target locales must be different")

        return cleaned_data


@admin.register(Locale)
class LocaleAdmin(admin.ModelAdmin):
    """Admin interface for managing locales."""

    list_display = [
        'code',
        'name',
        'native_name',
        'is_default',
        'is_active',
        'translation_progress_display',
        'actions_column',
    ]
    list_filter = ['is_active', 'is_default', 'rtl']
    search_fields = ['code', 'name', 'native_name']
    ordering = ['-is_default', 'sort_order', 'name']
    list_editable = ['is_active', 'sort_order'] if False else []  # Disabled for now

    fieldsets = (
        ('Basic Information', {'fields': ('code', 'name', 'native_name')}),
        ('Settings', {'fields': ('is_default', 'is_active', 'rtl', 'sort_order')}),
    )

    actions = ['publish_translations_action']

    change_list_template = 'admin/translations/locale/change_list.html'

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['openai_configured'] = is_openai_configured()
        return super().changelist_view(request, extra_context=extra_context)

    def translation_progress_display(self, obj):
        """Display translation progress with progress bar."""
        progress = obj.translation_progress

        if progress >= 100:
            color = '#28a745'
        elif progress >= 75:
            color = '#17a2b8'
        elif progress >= 50:
            color = '#ffc107'
        else:
            color = '#dc3545'

        return format_html(
            '<div style="width: 100px; background: #e9ecef; border-radius: 4px; overflow: hidden;">'
            '<div style="width: {}%; background: {}; height: 20px; line-height: 20px; text-align: center; color: white; font-size: 11px;">'
            '{}%</div></div>',
            min(progress, 100),
            color,
            progress,
        )

    translation_progress_display.short_description = 'Progress'

    def actions_column(self, obj):
        """Display action buttons for each locale."""
        publish_url = reverse('admin:translations_locale_publish', args=[obj.pk])
        return format_html(
            '<a class="button" style="padding: 4px 8px; background: #417690; color: white; '
            'text-decoration: none; border-radius: 4px;" href="{}">Publish</a>',
            publish_url,
        )

    actions_column.short_description = 'Actions'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:locale_id>/publish/',
                self.admin_site.admin_view(self.publish_translations_view),
                name='translations_locale_publish',
            ),
            path(
                'ai-translate/',
                self.admin_site.admin_view(self.ai_translate_view),
                name='translations_locale_ai_translate',
            ),
            path(
                'ai-progress/<int:job_id>/',
                self.admin_site.admin_view(self.ai_progress_view),
                name='translations_locale_ai_progress',
            ),
        ]
        return custom_urls + urls

    def publish_translations_view(self, request, locale_id):
        """Handle publish button click."""
        try:
            locale = Locale.objects.get(pk=locale_id)
            publisher = TranslationPublisher()
            version = publisher.publish(locale, request.user)
            messages.success(request, f"Successfully published {locale.name} translations as {version.version}")
        except Locale.DoesNotExist:
            messages.error(request, "Locale not found")
        except Exception as e:
            messages.error(request, f"Failed to publish: {str(e)}")

        return HttpResponseRedirect(reverse('admin:translations_locale_changelist'))

    def ai_translate_view(self, request):
        """Handle AI translation form."""
        # Check if OpenAI is configured
        if not is_openai_configured():
            messages.error(request, "OpenAI API is not configured. Set OPENAI_API_KEY environment variable.")
            return HttpResponseRedirect(reverse('admin:translations_locale_changelist'))

        if request.method == 'POST':
            form = AITranslationForm(request.POST)
            if form.is_valid():
                # Create the job
                job = AITranslationJob.objects.create(
                    source_locale=form.cleaned_data['source_locale'],
                    target_locale=form.cleaned_data['target_locale'],
                    overwrite_existing=form.cleaned_data['overwrite_existing'],
                    auto_publish=form.cleaned_data['auto_publish'],
                    batch_size=form.cleaned_data['batch_size'],
                    created_by=request.user,
                )

                # Redirect to the progress page which will use browser polling
                return HttpResponseRedirect(reverse('admin:translations_locale_ai_progress', args=[job.id]))
        else:
            # Pre-select English as source if available
            initial = {}
            try:
                en_locale = Locale.objects.get(code='en', is_active=True)
                initial['source_locale'] = en_locale
            except Locale.DoesNotExist:
                pass
            form = AITranslationForm(initial=initial)

        context = {
            **self.admin_site.each_context(request),
            'form': form,
            'title': 'AI Translate Locale',
            'opts': self.model._meta,
            'openai_model': getattr(__import__('django.conf', fromlist=['settings']).settings, 'OPENAI_MODEL', 'gpt-4'),
        }
        return render(request, 'admin/translations/locale/ai_translate.html', context)

    def ai_progress_view(self, request, job_id):
        """Show AI translation progress page with browser polling."""
        try:
            job = AITranslationJob.objects.get(pk=job_id)
        except AITranslationJob.DoesNotExist:
            messages.error(request, "Job not found")
            return HttpResponseRedirect(reverse('admin:translations_locale_changelist'))

        context = {
            **self.admin_site.each_context(request),
            'job': job,
            'job_id': job_id,
            'title': f'AI Translation Progress: {job.source_locale.code} → {job.target_locale.code}',
            'opts': self.model._meta,
            'api_url': f'/api/translations/ai-jobs/{job_id}/process-batch/',
        }
        return render(request, 'admin/translations/locale/ai_progress.html', context)

    @admin.action(description='Publish translations to CDN')
    def publish_translations_action(self, request, queryset):
        """Bulk publish translations for selected locales."""
        publisher = TranslationPublisher()
        success_count = 0

        for locale in queryset.filter(is_active=True):
            try:
                version = publisher.publish(locale, request.user)
                success_count += 1
                messages.success(request, f"Published {locale.code}: {version.version}")
            except Exception as e:
                messages.error(request, f"Failed to publish {locale.code}: {str(e)}")

        if success_count > 0:
            messages.info(request, f"Published {success_count} locale(s)")


@admin.register(Translation)
class TranslationAdmin(admin.ModelAdmin):
    """Admin interface for individual translations."""

    list_display = ['key_link', 'locale', 'truncated_value', 'status', 'translated_by', 'updated_at']
    list_filter = ['status', 'locale', 'key__is_deprecated', 'updated_at']
    search_fields = ['key__key', 'key__default_message', 'value']
    autocomplete_fields = ['key']
    list_select_related = ['key', 'locale', 'translated_by']
    list_per_page = 50

    fieldsets = (
        ('Translation', {'fields': ('key', 'locale', 'value', 'status')}),
        ('Reference', {'fields': ('default_message_display',), 'classes': ('collapse',)}),
        ('Audit', {'fields': ('translated_by', 'reviewed_by', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['default_message_display', 'translated_by', 'created_at', 'updated_at']

    actions = ['approve_translations', 'publish_translations', 'mark_for_review']

    def key_link(self, obj):
        """Display key as link to the translation key."""
        url = reverse('admin:translations_translationkey_change', args=[obj.key.pk])
        return format_html('<a href="{}">{}</a>', url, obj.key.key)

    key_link.short_description = 'Key'
    key_link.admin_order_field = 'key__key'

    def truncated_value(self, obj):
        """Display truncated translation value."""
        max_len = 60
        if len(obj.value) > max_len:
            return f"{obj.value[:max_len]}..."
        return obj.value

    truncated_value.short_description = 'Translation'

    def default_message_display(self, obj):
        """Display the default message for reference."""
        return obj.key.default_message

    default_message_display.short_description = 'Default Message (Reference)'

    def save_model(self, request, obj, form, change):
        if not obj.translated_by:
            obj.translated_by = request.user
        super().save_model(request, obj, form, change)

    @admin.action(description='Approve selected translations')
    def approve_translations(self, request, queryset):
        updated = queryset.filter(status__in=[Translation.Status.DRAFT, Translation.Status.REVIEW]).update(
            status=Translation.Status.APPROVED, reviewed_by=request.user
        )
        messages.success(request, f"Approved {updated} translation(s)")

    @admin.action(description='Publish selected translations')
    def publish_translations(self, request, queryset):
        updated = queryset.update(status=Translation.Status.PUBLISHED)
        messages.success(request, f"Published {updated} translation(s)")

    @admin.action(description='Mark for review')
    def mark_for_review(self, request, queryset):
        updated = queryset.update(status=Translation.Status.REVIEW)
        messages.success(request, f"Marked {updated} translation(s) for review")


@admin.register(TranslationVersion)
class TranslationVersionAdmin(admin.ModelAdmin):
    """Admin interface for translation version history."""

    list_display = [
        'version',
        'locale',
        'is_active',
        'translation_count',
        'published_by',
        'published_at',
        'actions_column',
    ]
    list_filter = ['locale', 'is_active', 'published_at']
    readonly_fields = [
        'locale',
        'version',
        's3_key',
        'content_hash',
        'published_at',
        'published_by',
        'translation_count',
    ]
    search_fields = ['version', 'locale__code', 'locale__name']
    list_select_related = ['locale', 'published_by']
    ordering = ['-published_at']

    def has_add_permission(self, request):
        return False  # Versions are created through publishing

    def actions_column(self, obj):
        """Display action buttons for each version."""
        if obj.is_active:
            return format_html('<span style="color: #28a745;">● Active</span>')

        activate_url = reverse('admin:translations_translationversion_activate', args=[obj.pk])
        return format_html(
            '<a class="button" style="padding: 4px 8px; background: #28a745; color: white; '
            'text-decoration: none; border-radius: 4px;" href="{}">Activate</a>',
            activate_url,
        )

    actions_column.short_description = 'Actions'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:version_id>/activate/',
                self.admin_site.admin_view(self.activate_version_view),
                name='translations_translationversion_activate',
            ),
        ]
        return custom_urls + urls

    def activate_version_view(self, request, version_id):
        """Handle activate button click (rollback to version)."""
        try:
            version = TranslationVersion.objects.get(pk=version_id)
            publisher = TranslationPublisher()
            publisher.rollback_to(version)
            messages.success(request, f"Activated version {version.version} for {version.locale.name}")
        except TranslationVersion.DoesNotExist:
            messages.error(request, "Version not found")
        except Exception as e:
            messages.error(request, f"Failed to activate: {str(e)}")

        return HttpResponseRedirect(reverse('admin:translations_translationversion_changelist'))


@admin.register(AITranslationJob)
class AITranslationJobAdmin(admin.ModelAdmin):
    """Admin interface for AI translation jobs."""

    list_display = [
        'id',
        'source_locale',
        'target_locale',
        'status_badge',
        'progress_display',
        'stats_display',
        'created_by',
        'created_at',
        'actions_column',
    ]
    list_filter = ['status', 'source_locale', 'target_locale', 'created_at']
    search_fields = ['source_locale__code', 'target_locale__code', 'created_by__email']
    readonly_fields = [
        'source_locale',
        'target_locale',
        'status',
        'total_keys',
        'processed_keys',
        'failed_keys',
        'skipped_keys',
        'error_message',
        'failed_key_ids',
        'celery_task_id',
        'created_by',
        'created_at',
        'started_at',
        'completed_at',
        'overwrite_existing',
        'auto_publish',
        'batch_size',
    ]
    list_select_related = ['source_locale', 'target_locale', 'created_by']
    ordering = ['-created_at']
    list_per_page = 25

    fieldsets = (
        (
            'Job Configuration',
            {'fields': ('source_locale', 'target_locale', 'overwrite_existing', 'auto_publish', 'batch_size')},
        ),
        ('Progress', {'fields': ('status', 'total_keys', 'processed_keys', 'failed_keys', 'skipped_keys')}),
        ('Errors', {'fields': ('error_message', 'failed_key_ids'), 'classes': ('collapse',)}),
        (
            'Tracking',
            {
                'fields': ('celery_task_id', 'created_by', 'created_at', 'started_at', 'completed_at'),
                'classes': ('collapse',),
            },
        ),
    )

    actions = ['cancel_jobs', 'retry_jobs']

    def has_add_permission(self, request):
        return False  # Jobs are created via the AI Translate action

    def status_badge(self, obj):
        """Display status with color-coded badge."""
        colors = {
            AITranslationJob.Status.PENDING: '#6c757d',
            AITranslationJob.Status.IN_PROGRESS: '#17a2b8',
            AITranslationJob.Status.COMPLETED: '#28a745',
            AITranslationJob.Status.FAILED: '#dc3545',
            AITranslationJob.Status.CANCELLED: '#ffc107',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="padding: 3px 8px; border-radius: 4px; background: {}; color: white;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def progress_display(self, obj):
        """Display progress bar."""
        progress = obj.progress_percent

        if obj.status == AITranslationJob.Status.COMPLETED:
            color = '#28a745'
        elif obj.status == AITranslationJob.Status.FAILED:
            color = '#dc3545'
        elif obj.status == AITranslationJob.Status.IN_PROGRESS:
            color = '#17a2b8'
        else:
            color = '#6c757d'

        return format_html(
            '<div style="width: 120px; background: #e9ecef; border-radius: 4px; overflow: hidden;">'
            '<div style="width: {}%; background: {}; height: 20px; line-height: 20px; '
            'text-align: center; color: white; font-size: 11px; min-width: 30px;">'
            '{}%</div></div>',
            max(progress, 5) if progress > 0 else 0,
            color,
            progress,
        )

    progress_display.short_description = 'Progress'

    def stats_display(self, obj):
        """Display translation statistics."""
        if obj.total_keys == 0:
            return '—'

        success = obj.successful_translations
        failed = obj.failed_keys

        parts = [f'{success} ✓']
        if failed > 0:
            parts.append(f'{failed} ✗')

        return format_html('<span title="Successful: {}, Failed: {}">{}</span>', success, failed, ' / '.join(parts))

    stats_display.short_description = 'Translations'

    def actions_column(self, obj):
        """Display action buttons."""
        if obj.status == AITranslationJob.Status.IN_PROGRESS:
            cancel_url = reverse('admin:translations_aitranslationjob_cancel', args=[obj.pk])
            return format_html(
                '<a class="button" style="padding: 4px 8px; background: #dc3545; color: white; '
                'text-decoration: none; border-radius: 4px;" href="{}">Cancel</a>',
                cancel_url,
            )
        elif obj.status == AITranslationJob.Status.FAILED:
            retry_url = reverse('admin:translations_aitranslationjob_retry', args=[obj.pk])
            return format_html(
                '<a class="button" style="padding: 4px 8px; background: #ffc107; color: black; '
                'text-decoration: none; border-radius: 4px;" href="{}">Retry</a>',
                retry_url,
            )
        return '—'

    actions_column.short_description = 'Actions'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:job_id>/cancel/',
                self.admin_site.admin_view(self.cancel_job_view),
                name='translations_aitranslationjob_cancel',
            ),
            path(
                '<int:job_id>/retry/',
                self.admin_site.admin_view(self.retry_job_view),
                name='translations_aitranslationjob_retry',
            ),
        ]
        return custom_urls + urls

    def cancel_job_view(self, request, job_id):
        """Cancel a running job."""
        try:
            job = AITranslationJob.objects.get(pk=job_id)
            if job.status == AITranslationJob.Status.IN_PROGRESS:
                job.status = AITranslationJob.Status.CANCELLED
                job.save()
                messages.success(request, f"Job {job_id} cancelled")
            else:
                messages.warning(request, f"Job {job_id} is not in progress")
        except AITranslationJob.DoesNotExist:
            messages.error(request, "Job not found")

        return HttpResponseRedirect(reverse('admin:translations_aitranslationjob_changelist'))

    def retry_job_view(self, request, job_id):
        """Retry a failed job - redirect to progress page for browser polling."""
        try:
            job = AITranslationJob.objects.get(pk=job_id)
            if job.status == AITranslationJob.Status.FAILED:
                # Reset job state
                job.status = AITranslationJob.Status.PENDING
                job.processed_keys = 0
                job.failed_keys = 0
                job.failed_key_ids = []
                job.error_message = ''
                job.started_at = None
                job.completed_at = None
                job.save()

                messages.info(request, f"Restarting job {job_id}...")
                # Redirect to progress page which uses browser polling
                return HttpResponseRedirect(reverse('admin:translations_locale_ai_progress', args=[job_id]))
            else:
                messages.warning(request, f"Job {job_id} is not in failed state")
        except AITranslationJob.DoesNotExist:
            messages.error(request, "Job not found")

        return HttpResponseRedirect(reverse('admin:translations_aitranslationjob_changelist'))

    @admin.action(description='Cancel selected jobs')
    def cancel_jobs(self, request, queryset):
        """Cancel selected running jobs."""
        updated = queryset.filter(status=AITranslationJob.Status.IN_PROGRESS).update(
            status=AITranslationJob.Status.CANCELLED
        )
        messages.success(request, f"Cancelled {updated} job(s)")

    @admin.action(description='Reset selected failed jobs for retry')
    def retry_jobs(self, request, queryset):
        """Reset selected failed jobs so they can be retried."""
        count = 0
        for job in queryset.filter(status=AITranslationJob.Status.FAILED):
            job.status = AITranslationJob.Status.PENDING
            job.processed_keys = 0
            job.failed_keys = 0
            job.failed_key_ids = []
            job.error_message = ''
            job.started_at = None
            job.completed_at = None
            job.save()
            count += 1

        if count > 0:
            messages.success(request, f"Reset {count} job(s). Click the Retry button on each job to start processing.")
        else:
            messages.warning(request, "No failed jobs to reset.")
