import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Sign out
      </button>
    </form>
  );
}
