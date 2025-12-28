"""
URL configuration for translations app.
"""

from django.urls import path

from . import views

app_name = 'translations'

urlpatterns = [
    # Public endpoints
    path('locales/', views.AvailableLocalesView.as_view(), name='locales'),
    path('<str:locale_code>.json', views.TranslationsJsonView.as_view(), name='translations-json'),
    
    # Admin endpoints
    path('sync/', views.SyncTranslationsView.as_view(), name='sync'),
    path('publish/', views.PublishTranslationsView.as_view(), name='publish'),
    path('status/', views.TranslationStatusView.as_view(), name='status'),
    
    # AI Translation endpoints (browser polling)
    # Note: Include both with and without trailing slash for compatibility
    path('ai-jobs/', views.AITranslationJobListView.as_view(), name='ai-jobs'),
    path('ai-jobs', views.AITranslationJobListView.as_view()),
    path('ai-jobs/<int:job_id>/', views.AITranslationJobDetailView.as_view(), name='ai-job-detail'),
    path('ai-jobs/<int:job_id>', views.AITranslationJobDetailView.as_view()),
    path('ai-jobs/<int:job_id>/process-batch/', views.AITranslationProcessBatchView.as_view(), name='ai-job-process'),
    path('ai-jobs/<int:job_id>/process-batch', views.AITranslationProcessBatchView.as_view()),
]

