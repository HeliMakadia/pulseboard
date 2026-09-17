"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

type Workspace = {
  id: string;
  name: string;
  members: Member[];
};

export default function TeamPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/workspaces/members",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setError(
            data.error ||
              "Unable to load workspace members."
          );
          return;
        }

        const loadedWorkspaces: Workspace[] =
          data.workspaces || [];

        setWorkspaces(loadedWorkspaces);

        if (loadedWorkspaces.length > 0) {
          setSelectedWorkspaceId(
            loadedWorkspaces[0].id
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Something went wrong while loading your team."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedWorkspace = useMemo(
    () =>
      workspaces.find(
        (workspace) =>
          workspace.id === selectedWorkspaceId
      ) || null,
    [workspaces, selectedWorkspaceId]
  );

  const members = selectedWorkspace?.members || [];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading team...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>

          <h1 className="text-lg font-semibold">
            No workspace found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a workspace to start building your team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Team
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage the people who collaborate across your
              workspaces.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {workspaces.length > 1 && (
              <div className="sm:min-w-56">
                <label
                  htmlFor="workspace"
                  className="mb-2 block text-xs font-medium text-muted-foreground"
                >
                  Workspace
                </label>

                <select
                  id="workspace"
                  value={selectedWorkspaceId}
                  onChange={(event) =>
                    setSelectedWorkspaceId(
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {workspaces.map((workspace) => (
                    <option
                      key={workspace.id}
                      value={workspace.id}
                    >
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Invite member
            </button>
          </div>
        </div>

        {/* Workspace summary */}
        {selectedWorkspace && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Workspace
                  </p>

                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-2 truncate text-lg font-semibold">
                  {selectedWorkspace.name}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Team members
                  </p>

                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-2 text-lg font-semibold">
                  {members.length}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Workspace owner
                  </p>

                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-2 truncate text-lg font-semibold">
                  {members.find(
                    (member) => member.role === "OWNER"
                  )?.name ||
                    members.find(
                      (member) => member.role === "OWNER"
                    )?.email ||
                    "Not available"}
                </p>
              </div>
            </div>

            {/* Members */}
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Workspace members
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    People with access to this workspace.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {members.length}{" "}
                  {members.length === 1
                    ? "member"
                    : "members"}
                </span>
              </div>

              {members.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="font-medium">
                    No members yet
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Invite teammates to collaborate on this
                    workspace.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {members.map((member) => {
                    const displayName =
                      member.name ||
                      member.email ||
                      "Unnamed member";

                    const initial = displayName
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 px-6 py-4 transition hover:bg-muted/30"
                      >
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initial
                          )}
                        </div>

                        {/* Member info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {displayName}
                          </p>

                          {member.email && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {member.email}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Role */}
                        <div className="hidden sm:block">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              member.role === "OWNER"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>

                        {/* More */}
                        <button
                          type="button"
                          disabled
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-50"
                          aria-label={`Actions for ${displayName}`}
                          title="Member actions coming soon"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Invite dialog */}
      {selectedWorkspace && inviteOpen && (
        <InviteMemberDialog
          workspaceId={selectedWorkspace.id}
          workspaceName={selectedWorkspace.name}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}