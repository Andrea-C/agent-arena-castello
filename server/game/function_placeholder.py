class FunctionPlaceholder:
    def __init__(self, source: str) -> None:
        self.source = source

    def __repr__(self) -> str:
        return f"<FunctionPlaceholder {self.source[:40]}...>"
