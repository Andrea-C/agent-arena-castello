"""
Memory Tools for Castello AI Agents

These tools allow agents to save and read notes in a markdown file,
providing persistent memory across game turns. Notes are organized
by category for easy retrieval.
"""

import os
from datetime import datetime


# Notes file path - stored in the agents/ directory
NOTES_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES_FILE = os.path.join(NOTES_DIR, "game_notes.md")

VALID_CATEGORIES = ["rooms", "items", "puzzles", "strategy", "general"]


def save_note(note: str, category: str = "general") -> dict:
    """Save a note to persistent memory.

    Use this to remember important information about the game:
    rooms you visited, items you found, puzzles you encountered,
    strategies that worked or failed.

    Args:
        note (str): The note text to save.
        category (str): Category for the note. Options: "rooms", "items",
            "puzzles", "strategy", "general". Defaults to "general".

    Returns:
        dict: Confirmation that the note was saved, or error information.
    """
    if category not in VALID_CATEGORIES:
        return {
            "status": "error",
            "error_message": f"Invalid category '{category}'. Use one of: {', '.join(VALID_CATEGORIES)}",
        }

    if not note.strip():
        return {
            "status": "error",
            "error_message": "Note text cannot be empty.",
        }

    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Create file with header if it doesn't exist
        if not os.path.exists(NOTES_FILE):
            with open(NOTES_FILE, "w", encoding="utf-8") as f:
                f.write("# Game Notes\n\n")
                f.write("Notes saved by the AI agent during gameplay.\n\n")

        with open(NOTES_FILE, "a", encoding="utf-8") as f:
            f.write(f"## [{category}] {timestamp}\n\n")
            f.write(f"{note}\n\n")
            f.write("---\n\n")

        return {
            "status": "success",
            "message": f"Note saved under category '{category}'.",
        }

    except Exception as e:
        return {
            "status": "error",
            "error_type": "file_error",
            "error_message": f"Could not save note: {str(e)}",
        }


def read_notes(category: str = "all") -> dict:
    """Read saved notes from persistent memory.

    Retrieve notes you previously saved. You can read all notes
    or filter by category.

    Args:
        category (str): Category to filter by. Use "all" to read everything,
            or one of: "rooms", "items", "puzzles", "strategy", "general".
            Defaults to "all".

    Returns:
        dict: The notes content as text, or error information.
    """
    if category != "all" and category not in VALID_CATEGORIES:
        return {
            "status": "error",
            "error_message": f"Invalid category '{category}'. Use 'all' or one of: {', '.join(VALID_CATEGORIES)}",
        }

    if not os.path.exists(NOTES_FILE):
        return {
            "status": "success",
            "notes": "",
            "message": "No notes saved yet.",
        }

    try:
        with open(NOTES_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        if category == "all":
            return {
                "status": "success",
                "notes": content,
            }

        # Filter by category
        lines = content.split("\n")
        filtered_lines = []
        include = False

        for line in lines:
            if line.startswith("## ["):
                # Check if this section matches the requested category
                include = line.startswith(f"## [{category}]")

            if include:
                filtered_lines.append(line)

        filtered_content = "\n".join(filtered_lines).strip()

        if not filtered_content:
            return {
                "status": "success",
                "notes": "",
                "message": f"No notes found for category '{category}'.",
            }

        return {
            "status": "success",
            "notes": filtered_content,
        }

    except Exception as e:
        return {
            "status": "error",
            "error_type": "file_error",
            "error_message": f"Could not read notes: {str(e)}",
        }
