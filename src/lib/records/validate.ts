import { DELETE_CONFIRMATION_TEXT } from "@/lib/records/types";
import { badRequest } from "@/lib/api/helpers";

export function parseDeleteConfirmation(body: unknown) {
  const confirm =
    typeof body === "object" && body !== null && "confirm" in body
      ? String((body as { confirm?: unknown }).confirm ?? "")
      : "";

  if (confirm !== DELETE_CONFIRMATION_TEXT) {
    return badRequest(`Type ${DELETE_CONFIRMATION_TEXT} to confirm permanent deletion.`);
  }

  return null;
}
