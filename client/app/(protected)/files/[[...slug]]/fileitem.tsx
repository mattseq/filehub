import React from "react";
import Link from "next/link";

interface FileInfoProps {
  path: string;
  name: string;
  isDir: boolean;
  size: number;
}

const FileInfo: React.FC<FileInfoProps> = ({ path, name, isDir, size }) => {
  const color = isDir ? "text-foam" : "text-text";
  console.log(path, name, isDir, size);
  return (
    <Link
      href={"/files/" + path}
      className="bg-base hover:bg-highlight-low flex"
      prefetch={false}
    >
      <span className={`${color} font-mono`}>{name}</span>
      {(size > 0 || !isDir) && (
        <span className="text-text font-mono ml-auto">{size}</span>
      )}
    </Link>
  );
};

export default FileInfo;
