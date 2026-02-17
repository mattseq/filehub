"use client";

import { useState, SubmitEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import axios, { AxiosProgressEvent } from "axios";

export default function PathControls({ path }: { path: string }) {
  const router = useRouter();
  const [controlState, setControlState] = useState(0);
  const [name, setName] = useState("");
  const [tracker, setTracker] = useState("");
  const { getKey } = useAuth();
  const queryClient = useQueryClient();

  const mkDir = () => {
    setControlState(1);
    setName("");
  };

  const submitMkDir = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name === "") return;

    setControlState(0);
    setName("");

    const response = await fetch("/api/files-dirs/" + path + "/" + name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getKey(),
      },
    });

    router.refresh();
    queryClient.invalidateQueries({ queryKey: ["files-view", path] });
  };

  const cancelMkDir = () => {
    setControlState(0);
    setName("");
  };

  const rmDir = () => {
    setControlState(2);
    setName("");
  };

  const submitRmDir = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name === "") return;

    setControlState(0);
    setName("");

    const response = await fetch("/api/files-dirs/" + path + "/" + name, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getKey(),
      },
    });

    router.refresh();
    queryClient.invalidateQueries({ queryKey: ["files-view", path] });
  };

  const cancelRmDir = () => {
    setControlState(0);
    setName("");
  };

  const upload = () => {
    setControlState(3);
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const response1 = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!}/gen/upload/` +
        path +
        "/" +
        file.name,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + getKey(),
        },
      },
    );
    const data = await response1.json();
    const url = data.url;

    console.log("HAI");
    const response2 = await axios.post(url, formData, {
      headers: {
        Authorization: "Bearer " + getKey(),
      },
      onUploadProgress: onUploadProgress,
    });
    console.log("BAI");

    // const response2 = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     Authorization: "Bearer " + getKey(),
    //   },
    //   body: formData,
    // });

    router.refresh();
    queryClient.invalidateQueries({ queryKey: ["files-view", path] });
  };

  const onUploadProgress = (event: AxiosProgressEvent) => {
    if (event.total)
      setTracker(
        Math.round((event.loaded / event.total) * 100).toString() + "%",
      );
    else setTracker(event.loaded.toString());
  };

  const cancelUpload = () => {
    setControlState(0);
    setName("");
  };

  return (
    <div className="flex gap-4 w-[50%]">
      {controlState === 0 ? (
        <>
          <button
            className="text-pine font-mono cursor-pointer"
            onClick={mkDir}
          >
            mkdir
          </button>
          <button
            className="text-pine font-mono cursor-pointer"
            onClick={rmDir}
          >
            rmdir
          </button>
          <button
            className="text-pine font-mono cursor-pointer"
            onClick={upload}
          >
            upload
          </button>
        </>
      ) : controlState === 1 ? (
        <form onSubmit={submitMkDir} className="flex w-full">
          <button
            type="submit"
            className="text-pine font-mono text-left cursor-pointer"
          >
            mkdir
          </button>
          <button
            type="button"
            onClick={cancelMkDir}
            className="text-foam font-mono text-left ml-4 cursor-pointer"
          >
            nvm
          </button>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            autoFocus
            className="text-text font-mono ml-4 outline-none grow"
          />
        </form>
      ) : controlState === 2 ? (
        <form onSubmit={submitRmDir} className="flex w-full">
          <button
            type="submit"
            className="text-pine font-mono text-left cursor-pointer"
          >
            rmdir
          </button>
          <button
            type="button"
            onClick={cancelRmDir}
            className="text-foam font-mono text-left ml-4 cursor-pointer"
          >
            nvm
          </button>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            autoFocus
            className="text-text font-mono ml-4 outline-none grow"
          />
        </form>
      ) : controlState === 3 ? (
        <div className="flex w-full">
          <label
            htmlFor="uploadinput"
            className="text-pine font-mono cursor-pointer"
          >
            choose file
          </label>
          <input
            id="uploadinput"
            type="file"
            onChange={onUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={cancelUpload}
            className="text-foam font-mono text-left ml-4 cursor-pointer"
          >
            nvm
          </button>
          <p className="text-text font-mono ml-4 grow">{name}</p>
          <p className="text-text font-mono ml-4">{tracker}</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
