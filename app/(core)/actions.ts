'use server';

import { apiFetch } from "@/lib/api";

export async function createWebCallAction(agentId: string) {
  const response = await apiFetch(`/api/v1/create-web-call`, {
    method: "POST",
    body: JSON.stringify({ agentId }),
  });
  if(!response.ok) {
    const errorText = await response.text();
    console.error("Create Web Call Failed:", errorText);
    throw new Error(`Failed to test agent: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
