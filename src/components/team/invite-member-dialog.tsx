"use client";

import { FormEvent, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  X,
} from "lucide-react";

type InviteMemberDialogProps = {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
};

export function InviteMemberDialog({
  workspaceId,
  workspaceName,
  onClose,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCopied(false);

      const response = await fetch(
        "/api/workspaces/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            workspaceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to create invitation."
        );
        return;
      }

      setInviteUrl(data.invite.inviteUrl);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        inviteUrl
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Unable to copy the invitation link."
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="w-full max-w-md rounded-2xl border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>

            <h2
              id="invite-member-title"
              className="text-lg font-semibold"
            >
              Invite member
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Invite someone to join{" "}
              <span className="font-medium text-foreground">
                {workspaceName}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!inviteUrl ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6"
          >
            <div>
              <label
                htmlFor="invite-email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="invite-email"
                type="email"
                autoFocus
                placeholder="teammate@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  !email.trim()
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading
                  ? "Creating..."
                  : "Create invitation"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 p-6">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>

                <p className="text-sm font-semibold">
                  Invitation created
                </p>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                Share this invitation link with{" "}
                <span className="font-medium text-foreground">
                  {email}
                </span>
                . The invitation expires in 7 days.
              </p>
            </div>

            <div>
              <label
                htmlFor="invite-url"
                className="mb-2 block text-sm font-medium"
              >
                Invitation link
              </label>

              <div className="flex gap-2">
                <input
                  id="invite-url"
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-xs outline-none"
                />

                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}

                  <span className="hidden sm:inline">
                    {copied ? "Copied" : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
