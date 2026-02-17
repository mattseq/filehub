"use client";

import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login, logout, getKey } = useAuth();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!key) {
      setMessage("cmon bro u gotta enter ur key");
      return;
    }

    login(key);
    setMessage("");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getKey(),
        },
        body: JSON.stringify({ key }),
      },
    );

    if (response.ok) {
      router.push("/");
    } else {
      if (response.status == 500) {
        setMessage("lmao internal error");
      } else if (response.status == 401) {
        setMessage("invalid key");
      } else {
        const data = await response.json();
        setMessage(data.message);
      }
      setKey("");
      logout();
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="password"
          name="key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="key"
          autoFocus
          className="text-text font-mono block outline-none w-full"
        />
        <button
          type="submit"
          className="text-text font-mono block w-full text-left hover:text-rose transition-[color] ease-out cursor-pointer"
        >
          login
        </button>
      </form>
      <p className="text-love font-mono w-full">{message}</p>
    </div>
  );
}
