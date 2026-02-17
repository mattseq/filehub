"use client";

import { useAuth } from "@/app/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    logout();
    router.push("/");
  };

  return (
    <div>
      <p className="text-text font-mono w-full">u sure?</p>
      <button
        onClick={handleClick}
        className="font-mono text-rose hover:text-love transition-[color] ease-out cursor-pointer"
      >
        yeah
      </button>
    </div>
  );
}
