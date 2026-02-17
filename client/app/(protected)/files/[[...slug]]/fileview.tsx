"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";

export default function FileView({ path, data }: { path: string; data: any }) {
  const [loading, setLoading] = useState(true);
  const [href, setHref] = useState("");
  const { getKey } = useAuth();

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL!}/gen/download/` + path,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + getKey(),
          },
        },
      );
      const data = await response.json();
      const url = data.url;
      setHref(url);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="flex">
        <span className="text-text font-mono ml-auto">{data.details.size}</span>
      </div>
      {loading ? (
        <div className="bg-base flex">
          <span className="text-muted font-mono">loading...</span>
        </div>
      ) : (
        <a href={href} className="bg-base hover:bg-highlight-low flex">
          <span className="text-gold font-mono">download</span>
        </a>
      )}
    </div>
  );
}
