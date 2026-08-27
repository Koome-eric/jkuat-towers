import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 py-16">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-widest uppercase text-ink-soft">JKUAT Towers</p>
        <h1 className="text-2xl font-semibold mt-1">List your shop</h1>
        <p className="text-sm text-ink-soft mt-1">Create a vendor account — takes about a minute.</p>
      </div>
      <SignUp />
    </main>
  );
}
