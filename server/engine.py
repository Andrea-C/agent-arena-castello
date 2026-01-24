from typing import Dict, Tuple

from .game.core import GameCore


class GameEngine:
    def __init__(self) -> None:
        self.core = GameCore()

    def menu_text(self) -> str:
        return self.core.menu_text()

    def help_text(self) -> str:
        return self.core.help_text()

    def start_game(self) -> Tuple[Dict, str]:
        return self.core.start_game()

    def process(self, state: Dict, input_text: str) -> Tuple[Dict, str]:
        return self.core.process(state, input_text)

    def serialize_state(self, state: Dict) -> str:
        return self.core.serialize_state(state)

    def deserialize_state(self, raw: str) -> Dict:
        return self.core.deserialize_state(raw)
