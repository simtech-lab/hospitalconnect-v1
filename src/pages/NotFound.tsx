import { HospitalMark } from "@/components/site/HospitalMark";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
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
                Official website
              </span>
            </span>
          </Link>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col items-start justify-center py-16">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            404
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-6xl">
            This page has moved off the ward.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            The page you are looking for is not on the hospital website. Head
            back to the homepage for hospital information, services and visiting
            guidance.
          </p>
          <Button asChild className="mt-8 rounded-full px-6">
            <Link to="/">
              Back to the homepage
              <ArrowLeft className="size-4 rotate-180" />
            </Link>
          </Button>
        </main>
      </div>
    </div>
  );
}
