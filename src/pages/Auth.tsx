import { HospitalMark } from "@/components/site/HospitalMark";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useConvex, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const convex = useConvex();
  const hasAdmin = useQuery(api.admins.hasAdmin);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();
      formData.set("email", email);

      const access = await convex.query(api.admins.canSignIn, { email });
      if (!access.allowed) {
        setError(
          "This website is managed by hospital administrators. Only registered administrator emails can sign in.",
        );
        setIsLoading(false);
        return;
      }

      await signIn("email-otp", formData);
      setStep({ email });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="ridge-pattern absolute inset-0 opacity-40" />
        <div className="absolute -right-24 -top-24 size-[420px] rounded-full border border-primary-foreground/10" />
        <div className="absolute -bottom-32 -left-20 size-[360px] rounded-full bg-[oklch(0.44_0.07_160)]/60" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <HospitalMark className="size-11" />
            <span>
              <span className="block font-display text-xl leading-none tracking-tight">
                Kwahu Government Hospital
              </span>
              <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
                Ghana Health Service · Eastern Region
              </span>
            </span>
          </Link>
        </div>

        <div className="relative max-w-md py-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-soft">
            Administrator console
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-balance">
            Publish the hospital&apos;s official website.
          </h1>
          <p className="mt-5 text-sm leading-7 text-primary-foreground/70">
            Hospital administrators sign in here to create and publish the
            content that appears on the public site.
          </p>

          <ul className="mt-9 space-y-4 text-sm text-primary-foreground/85">
            {[
              {
                title: "Homepage slider",
                detail: "Images, headlines and links in the hero banner.",
              },
              {
                title: "Hospital information",
                detail: "Profile, opening hours and contact details.",
              },
              {
                title: "Services & departments",
                detail: "The care areas shown to patients and partners.",
              },
              {
                title: "Doctors & management",
                detail: "Profiles of the team patients will meet.",
              },
              {
                title: "Upcoming events",
                detail: "Flyers, photo galleries and videos.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <Check className="size-3" />
                </span>
                <span>
                  <span className="font-medium text-primary-foreground">
                    {item.title}
                  </span>
                  <span className="block text-xs leading-6 text-primary-foreground/60">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-[11px] text-primary-foreground/55">
          <span>Authorised administrators only</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Public website
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 lg:hidden">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <HospitalMark className="size-9" />
            <span className="truncate font-display text-lg leading-none tracking-tight">
              Kwahu Government Hospital
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Back
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <span className="eyebrow">Administrator access</span>
            <h2 className="mt-2 font-display text-4xl tracking-tight">
              Administrator sign in
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Only email addresses registered as hospital administrators can
              sign in. We&apos;ll send a one-time code to yours.
            </p>

            <Card className="mt-7 gap-0 border-border/80 py-0 shadow-none">
              {step === "signIn" ? (
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="field-label">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          autoComplete="email"
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="mt-3 text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="mt-4 w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowRight className="size-4" />
                      )}
                      Send sign-in code
                    </Button>

                    <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground/80">
                      {hasAdmin === false
                        ? "No administrator exists yet. The first person to sign in can claim administrator access."
                        : "New administrators are invited by an existing administrator from the console."}
                    </p>
                  </CardContent>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit}>
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">
                      Check your email
                    </CardTitle>
                    <CardDescription>
                      We sent a 6-digit code to{" "}
                      <span className="font-medium text-foreground">
                        {step.email}
                      </span>
                      .
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (event.target as HTMLElement).closest(
                              "form",
                            );
                            form?.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="mt-3 text-center text-sm text-destructive">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="mt-5 w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        <>
                          Verify and sign in
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                  <CardFooter className="flex-col gap-1 pb-5">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        setStep("signIn");
                        setOtp("");
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      Use a different email
                    </Button>
                  </CardFooter>
                </form>
              )}

              <div className="border-t border-border/70 bg-muted/40 px-6 py-3 text-center text-[11px] text-muted-foreground">
                Secured staff access · Kwahu Government Hospital
              </div>
            </Card>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Only administrators can sign in and publish content.{" "}
              <Link
                to="/"
                className="text-primary underline-offset-4 hover:underline"
              >
                Return to the public website
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
