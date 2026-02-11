"""Shared tools for Castello AI agents."""

from .castello_tools import (
    castello_register,
    castello_load_player,
    castello_play,
    castello_status,
    castello_set_language,
    castello_get_languages,
)
from .memory_tools import save_note, read_notes
