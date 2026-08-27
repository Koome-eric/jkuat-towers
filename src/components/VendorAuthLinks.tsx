import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Used in the header of the homepage (and could be reused anywhere) to
// show either "Sign in" / "List your shop" for anonymous visitors, or a
// direct link into their dashboard + Clerk's account menu once signed in.
export function VendorAuthLinks({ dark = false }: { dark?: boolean }) {
  const linkClass = dark
    ? "text-sm text-white/70 hover:text-white transition-colors"
    : "text-sm text-ink-soft hover:text-ink transition-colors";

  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <Link href="/sign-in" className={linkClass}>
          Vendor sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard" className={linkClass}>
          My dashboard
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
