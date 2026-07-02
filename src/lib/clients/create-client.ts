export type NewClientFormValues = {
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  industry: string;
  employeeCount: string;
  status: "prospect" | "active" | "inactive";
};

export const DEFAULT_NEW_CLIENT_FORM_VALUES: NewClientFormValues = {
  companyName: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  industry: "",
  employeeCount: "",
  status: "prospect",
};

export type CreatedClient = {
  id: string;
  companyName: string;
};

export async function submitNewClient(
  form: NewClientFormValues,
): Promise<{ ok: true; client: CreatedClient } | { ok: false; error: string }> {
  const response = await fetch("/api/v1/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...form,
      employeeCount: form.employeeCount ? Number(form.employeeCount) : null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      ok: false,
      error: typeof error.error === "string" ? error.error : "Failed to create client",
    };
  }

  const client = await response.json();
  return { ok: true, client: { id: client.id, companyName: client.companyName } };
}
