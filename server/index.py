import os
import stat
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from watchdog.observers import Observer
from watchdog.events import (
    DirCreatedEvent,
    DirDeletedEvent,
    DirModifiedEvent,
    DirMovedEvent,
    FileCreatedEvent,
    FileDeletedEvent,
    FileModifiedEvent,
    FileMovedEvent,
    FileSystemEventHandler,
)
from dataclasses import dataclass


@dataclass
class EntryNode:
    path: str
    size: int
    mtime: int
    children: list["EntryNode"] | None

    @classmethod
    def from_path(cls, path: str):
        info = os.stat(path)
        is_dir = stat.S_ISDIR(info.st_mode)
        return cls(path, info.st_size, int(info.st_mtime), [] if is_dir else None)

    @classmethod
    def from_direntry(cls, entry: os.DirEntry):
        info = os.stat(entry.path)
        return cls(
            entry.path, info.st_size, int(info.st_mtime), [] if entry.is_dir else None
        )


class Indexer:
    def __init__(self, path: str):
        self.root: EntryNode = EntryNode(path, 0, 0, [])
        self.build_index()
        self.observer_handler = IndexerHandler(self)
        self.observer = Observer()
        self.observer.schedule(self.observer_handler, path, recursive=True)

    def build_index(self):
        self._index_dir(self.root)

    def _index_dir(self, node: EntryNode):
        if node.children is None:
            return
        with os.scandir(node.path) as scan:
            for entry in scan:
                child = EntryNode.from_direntry(entry)
                node.children.append(child)
                if entry.is_dir():
                    self._index_dir(child)

    def is_subpath(self, child: str, parent: str):
        _child = Path(child).resolve()
        _parent = Path(child).resolve()
        try:
            return _child.is_relative_to(_parent)
        except ValueError:
            return False

    def get_containing_node(self, path: str):
        node = self.root
        while True:
            if node.children is None:
                raise Exception()
            options = [
                child
                for child in node.children
                if self.is_subpath(path, child.path) and child.children is not None
            ]
            if not options:
                break
            node = options[0]
        if node.children is None:
            raise Exception()
        return node

    def add_node(self, path: str):
        parent = self.get_containing_node(path)
        assert parent.children is not None
        node = EntryNode.from_path(path)
        parent.children.append(node)

    def remove_node(self, path: str):
        parent = self.get_containing_node(path)
        assert parent.children is not None
        for i, child in enumerate(list(parent.children)):
            if child.path == path:
                del parent.children[i]
                break


class IndexerHandler(FileSystemEventHandler):
    def __init__(self, indexer: Indexer):
        self.indexer = indexer

    def on_created(self, event: DirCreatedEvent | FileCreatedEvent) -> None:
        print(f"IndexerHandler.on_created(src_path = {str(event.src_path)})")
        self.indexer.add_node(str(event.src_path))

    def on_deleted(self, event: DirDeletedEvent | FileDeletedEvent) -> None:
        print(f"IndexerHandler.on_deleted(src_path = {str(event.src_path)})")
        self.indexer.remove_node(str(event.src_path))

    def on_moved(self, event: DirMovedEvent | FileMovedEvent) -> None:
        print(
            f"IndexerHandler.on_moved(src_path = {str(event.src_path)}, dest_path = {str(event.dest_path)})"
        )
        self.indexer.remove_node(str(event.src_path))
        self.indexer.add_node(str(event.dest_path))
