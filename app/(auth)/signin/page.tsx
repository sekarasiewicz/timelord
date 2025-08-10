"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <button
        className="inline-flex items-center gap-2 rounded bg-black text-white px-4 py-2 hover:opacity-90"
        onClick={() => signIn("github")}
      >
        Continue with GitHub
      </button>
    </div>
  );
}


