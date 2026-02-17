"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";

function Navbar() {
  const { loading, isLoggedIn } = useAuth();

  return (
    <div className="flex gap-8">
      <Link
        href="/"
        className="font-mono text-rose hover:text-love transition-[color] ease-out"
      >
        home
      </Link>
      {!loading &&
        (isLoggedIn ? (
          <Link
            href="/logout"
            className="font-mono text-rose hover:text-love transition-[color] ease-out"
          >
            logout
          </Link>
        ) : (
          <Link
            href="/login"
            className="font-mono text-rose hover:text-love transition-[color] ease-out"
          >
            login
          </Link>
        ))}
    </div>
  );
}

export default Navbar;
