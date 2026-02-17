"use client";

import { useAuth } from "@/app/lib/AuthContext";
import FileItem from "@/app/(protected)/files/[[...slug]]/fileitem";

export default function Home() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <p className="text-text font-mono">log in for file access</p>;
  }

  return (
    <div>
      <FileItem path={"/"} name={"/"} isDir={true} size={0} />
    </div>
  );
}
