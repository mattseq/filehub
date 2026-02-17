import FileItem from "./fileitem";

export default function FolderView({
  path,
  data,
}: {
  path: string;
  data: any;
}) {
  return (
    <div className="relative">
      {data?.contents
        ?.sort(
          (a: any, b: any) =>
            Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name),
        )
        .map((file: any, index: number) => (
          <FileItem
            key={`${file}-${index}`}
            path={file.path}
            name={file.name}
            isDir={file.is_dir}
            size={file.size}
          />
        ))}
      {/* <div className="absolute inset-[-40px] p-[40px] z-99 backdrop-blur-lg">
        <p className="text-text font-mono">oh hai :3</p>
      </div> */}
    </div>
  );
}
