"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LaunchFormState {
  projectName: string;
  repositoryUrl: string;
  branch: string;
}

export function LaunchForm(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<LaunchFormState>({
    projectName: "",
    repositoryUrl: "",
    branch: "main"
  });
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = (await response.json()) as { data?: { id: string }; error?: { message: string } };

      if (!response.ok || !data.data?.id) {
        setError(data.error?.message ?? "Unable to launch project");
        return;
      }

      router.push(`/build/${data.data.id}`);
    } catch {
      setError("Network error while launching project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="projectName">
            Project Name
          </label>
          <Input
            id="projectName"
            value={form.projectName}
            onChange={(event): void => setForm((prev): LaunchFormState => ({ ...prev, projectName: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="repositoryUrl">
            Repository URL
          </label>
          <Input
            id="repositoryUrl"
            value={form.repositoryUrl}
            onChange={(event): void => setForm((prev): LaunchFormState => ({ ...prev, repositoryUrl: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="branch">
            Branch
          </label>
          <Input
            id="branch"
            value={form.branch}
            onChange={(event): void => setForm((prev): LaunchFormState => ({ ...prev, branch: event.target.value }))}
            required
          />
        </div>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Launching..." : "Launch Build"}
        </Button>
      </form>
    </Card>
  );
}
