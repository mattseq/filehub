"use client";

import { use } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import FolderView from "./folderview";
import FileView from "./fileview";
import FileItem from "./fileitem";
import PathControls from "./pathcontrols";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default function FilesView({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug || [];
  const path = slug.join("/") || "";

  const { getKey } = useAuth();

  const { isLoading, error, data } = useQuery({
    queryKey: ["files-view", path],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL!}/files-view/${path}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + getKey(),
          },
        },
      );
      return await response.json();
    },
  });

  return (
    <div>
      <PathControls path={path} />
      <p className="text-subtle font-mono">{"/" + path}</p>
      {path && (
        <FileItem path={path + "/.."} name={".."} isDir={true} size={0} />
      )}
      {!!path || <div className="text-muted font-mono select-none">..</div>}
      {isLoading ? (
        <p className="text-muted font-mono">loading...</p>
      ) : data?.contents ? (
        <FolderView path={path} data={data} />
      ) : data?.details ? (
        <FileView path={path} data={data} />
      ) : (
        <></>
      )}
    </div>
  );
}
