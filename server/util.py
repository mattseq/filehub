from collections.abc import Generator
from pathlib import Path
from dataclasses import dataclass

from pathvalidate import sanitize_filepath


class SanitizedPath(Path):
    def iterdir(self) -> Generator["SanitizedPath", None, None]:
        for path in super().iterdir():
            yield SanitizedPath(path)


class UnsanitizedPathException(Exception):
    pass


@dataclass
class FileListing:
    real_path: Path
    view_path: Path
    name: str
    is_dir: bool
    size: int

    def to_json(self):
        return {
            "path": str(self.view_path),
            "name": self.name,
            "is_dir": self.is_dir,
            "size": self.size,
        }


def convert_path(path: str, root: str):
    _root = Path(root).resolve()
    _path = Path(path.lstrip("/"))
    real = (_root / _path).resolve()
    return real


def validate_path(path: Path, root: Path):
    _path = path.resolve()
    _root = root.resolve()
    return _path.is_relative_to(_root)


def sanitize_path(path: str, root: str):
    converted = convert_path(path, root)
    validated = validate_path(converted, Path(root))
    # unweirded = sanitize_filepath(str(validated))
    # print("UNWEIRDED " + str(unweirded))
    if validated:
        return SanitizedPath(converted)
    else:
        return None


def get_dir_listing(base_path: SanitizedPath, view_path: str):
    if not base_path.is_dir():
        return []
    listing = []
    for path in base_path.iterdir():
        prefix = view_path + "/" if view_path else ""
        listing.append(get_file_info(path, prefix + path.name))
    return listing


def get_file_info(real_path: SanitizedPath, view_path: str):
    info = real_path.resolve().stat()
    return FileListing(
        real_path=real_path,
        view_path=Path(view_path),
        name=real_path.name,
        is_dir=real_path.is_dir(),
        size=info.st_size,
    )


def yield_file(path: SanitizedPath):
    with open(str(path), mode="rb") as file:
        yield from file
