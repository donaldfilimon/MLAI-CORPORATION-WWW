import json
from pathlib import Path
from typing import cast

RESEARCH_CONTENT_PATH = Path("src/data/categories/research.ts")
NEW_PUBLICATIONS_PATH = Path("new_publications.json")


def main() -> None:
    content = RESEARCH_CONTENT_PATH.read_text()

    start_marker = "  publications: ["
    end_marker = "  ],"
    start_idx = content.find(start_marker)
    if start_idx == -1:
        raise ValueError(
            f"Could not find publications array in {RESEARCH_CONTENT_PATH}"
        )
    start_idx += len(start_marker)

    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        raise ValueError(
            f"Could not find end of publications array in {RESEARCH_CONTENT_PATH}"
        )

    loaded_publications = cast(object, json.loads(NEW_PUBLICATIONS_PATH.read_text()))
    if not isinstance(loaded_publications, list):
        raise TypeError(f"{NEW_PUBLICATIONS_PATH} must contain a JSON array")

    raw_publications = cast(list[object], loaded_publications)
    if not raw_publications:
        raise ValueError(f"{NEW_PUBLICATIONS_PATH} does not contain any publications")

    new_publications = ",\n".join(
        json.dumps(publication, indent=6) for publication in raw_publications
    )
    new_content = (
        content[:start_idx]
        + "\n"
        + content[start_idx:end_idx]
        + ",\n"
        + new_publications
        + "\n"
        + content[end_idx:]
    )

    _ = RESEARCH_CONTENT_PATH.write_text(new_content)


if __name__ == "__main__":
    main()
