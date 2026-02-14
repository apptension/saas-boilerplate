"""
Tests for AI Assistant WebSocket consumer.
"""

import pytest
from datetime import date

from apps.integrations.ai_assistant.consumer import (
    get_tool_display_name,
    get_cfo_system_prompt,
    TOOL_DISPLAY_NAMES,
)


@pytest.mark.django_db
class TestGetToolDisplayName:
    """Tests for get_tool_display_name function."""

    def test_returns_display_name_for_known_tool(self):
        assert get_tool_display_name("introspect") == "Analyzing data schema"
        assert get_tool_display_name("search") == "Searching company data"
        assert get_tool_display_name("GetDashboardOverview") == "Fetching financial overview"
        assert get_tool_display_name("GetProjects") == "Loading projects"

    def test_returns_fallback_for_unknown_tool(self):
        result = get_tool_display_name("unknown_tool")
        assert result == "Using unknown tool"

    def test_fallback_replaces_underscores_with_spaces(self):
        result = get_tool_display_name("my_custom_tool")
        assert result == "Using my custom tool"


@pytest.mark.django_db
class TestGetCfoSystemPrompt:
    """Tests for get_cfo_system_prompt function."""

    def test_returns_non_empty_string(self):
        prompt = get_cfo_system_prompt()
        assert isinstance(prompt, str)
        assert len(prompt) > 0

    def test_includes_todays_date(self):
        prompt = get_cfo_system_prompt()
        today = date.today().strftime("%B %d, %Y")
        assert today in prompt

    def test_includes_cfo_context(self):
        prompt = get_cfo_system_prompt()
        assert "CFO" in prompt or "Chief Financial Officer" in prompt

    def test_includes_tool_usage_instructions(self):
        prompt = get_cfo_system_prompt()
        assert "tenantId" in prompt or "tenant" in prompt.lower()


@pytest.mark.django_db
class TestToolDisplayNames:
    """Tests for TOOL_DISPLAY_NAMES constant."""

    def test_all_known_tools_have_display_names(self):
        for tool_name, display_name in TOOL_DISPLAY_NAMES.items():
            assert get_tool_display_name(tool_name) == display_name
            assert len(display_name) > 0
