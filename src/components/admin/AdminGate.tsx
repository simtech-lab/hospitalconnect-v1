import { HospitalMark } from "@/components/site/HospitalMark";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

/** Shown when a signed-in visitor does not have administrator access yet. */
export function AdminGate() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const hasAdmin = useQuery(api.admins.hasAdmin);
  const claimAdmin = useMutation(api.admins.claimAdmin);
  const [claiming, setClaiming] = useState(false);

  const identity =
    user?.name?.trim() ||
    user?.email?.trim() ||
    (user?.isAnonymous ? "Guest session" : "Signed-in account");

  async function handleClaim() {
    setClaiming(true);
    try {
      await claimAdmin({});
      toast.success("Administrator access granted. Welcome to the console.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not grant administrator access.",
      );
    } finally {
      setClaiming(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ghana-stripe h-1 w-full" />

      <div className="page-shell flex min-h-[calc(100vh-4px)] flex-col">
        <header className="flex items-center justify-between gap-4 py-6">
          <Link to="/" className="flex items-center gap-3">
            <HospitalMark className="size-10" />
            <span>
              <span className="block font-display text-xl leading-none tracking-tight">
                Kwahu Government Hospital
              </span>
              <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Administrator console
              </span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to website
            </Link>
          </Button>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-16">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card">
            <div className="border-b border-border/70 bg-secondary/40 p-7">
              <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                <ShieldCheck className="size-6" />
              </span>
              <h1 className="mt-5 font-display text-3xl leading-tight tracking-tight">
                Administrator access
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                All website content is created and published by hospital
                administration.
              </p>
            </div>

            <div className="p-7">
              {hasAdmin === undefined ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Checking administrator access…
                </div>
              ) : hasAdmin === false ? (
                <>
                  <p className="text-sm leading-7 text-muted-foreground">
                    No administrator has been set up for this website yet. Claim
                    the first administrator account to start publishing the
                    hospital website.
                  </p>
                  <Button
                    className="mt-5 w-full"
                    onClick={handleClaim}
                    disabled={claiming}
                  >
                    {claiming && <Loader2 className="size-4 animate-spin" />}
                    Claim administrator access
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm leading-7 text-muted-foreground">
                    This account does not have administrator access. Only
                    administrators can use the console. Ask hospital
                    administration to grant your account access.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild className="flex-1">
                      <Link to="/">Return to the website</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </div>
                </>
              )}

              <p className="mt-6 border-t border-border/70 pt-4 text-[11px] text-muted-foreground">
                Signed in as <span className="text-foreground">{identity}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
