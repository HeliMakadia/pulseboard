"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

type InviteData = {
  email: string;
  workspaceName: string;
  expiresAt: string;
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const token = params.token as string;

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      try {
        const response = await fetch(
          `/api/workspaces/invite/${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invitation not found");
        }

        setInvite(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load invitation"
        );
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadInvite();
    }
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/workspaces/invite/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to accept invitation"
        );
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept invitation"
      );
    } finally {
      setAccepting(false);
    }
  }

  function handleSignIn() {
    signIn("credentials", {
      callbackUrl: window.location.href,
    });
  }

  if (loading || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-sm text-muted-foreground">
          Loading invitation...
        </div>
      </main>
    );
  }

  if (error && !invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!invite) {
    return null;
  }

  const sessionEmail = session?.user?.email?.toLowerCase() || "";
  const invitedEmail = invite.email.toLowerCase();

  const isCorrectAccount =
    sessionEmail === invitedEmail;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            P
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Workspace invitation
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            You have been invited to join
          </p>

          <p className="mt-1 text-lg font-semibold">
            {invite.workspaceName}
          </p>
        </div>

        <div className="mt-8 rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Invitation sent to
          </p>

          <p className="mt-1 text-sm font-medium">
            {invite.email}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {status === "unauthenticated" ? (
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Sign in to accept
          </button>
        ) : isCorrectAccount ? (
          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accepting
              ? "Accepting invitation..."
              : "Accept invitation"}
          </button>
        ) : (
          <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="font-medium text-yellow-700 dark:text-yellow-400">
              Wrong account
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              This invitation was sent to{" "}
              <strong>{invite.email}</strong>.
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Currently signed in as:{" "}
              <strong>
                {sessionEmail || "Unknown account"}
              </strong>
            </p>

            <button
              type="button"
              onClick={() => signIn()}
              className="mt-4 w-full rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
            >
              Switch account
            </button>
          </div>
        )}
      </div>
    </main>
  );
}