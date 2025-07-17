import { deptApiCall } from "../utils/deptApi.js";
import { DeleteHoursSchema } from "./schemas.js";
import type { BookedHour } from "../utils/types.js";

// ...existing code...
export async function delete_hours(args: {
  id: number;
  idToken?: string;
}): Promise<unknown> {
  // Coerce id to number before schema validation
  const validated = DeleteHoursSchema.parse({
    ...args,
    id: Number(args.id)
  });
  const { DEPT_EMPLOYEE_ID } = await import("../utils/env.js");
  // Step 1: Fetch existing record using check_booked_hours (since direct GET is deprecated)
  const checkResult = await deptApiCall(
    `/bookedhours/custom/${DEPT_EMPLOYEE_ID}?from=2000-01-01&to=2100-01-01&id=${encodeURIComponent(
      String(validated.id)
    )}`
  );
  let existingRecord: BookedHour | null = null;
  if (
    checkResult &&
    typeof checkResult === "object" &&
    "result" in checkResult &&
    Array.isArray((checkResult as { result?: unknown }).result)
  ) {
    existingRecord =
      (checkResult as { result: BookedHour[] }).result.find(
        (entry: BookedHour) => Number(entry.id) === Number(validated.id)
      ) || null;
  }
  if (!existingRecord) {
    throw new Error(`Time booking with ID ${validated.id} not found`);
  }
  // Step 2: Delete the record
  try {
    const result = await deptApiCall(`/bookedhours/${Number(validated.id)}`, {
      method: "DELETE",
    });
    // Format date for display
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "Unknown";
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
    return {
      content: [
        {
          type: "text",
          text:
            `🗑️ Successfully deleted time entry (ID: ${validated.id})\n\n` +
            `**Deleted Entry Details:**\n` +
            `- Date: ${formatDate(existingRecord.date)}\n` +
            `- Hours: ${existingRecord.hours || "Unknown"}\n` +
            `- Description: ${
              existingRecord.description || "No description"
            }\n` +
            `- Project: ${existingRecord.projectName || "Unknown"}\n` +
            `- Budget: ${existingRecord.budgetName || "Unknown"}\n\n` +
            `**Deletion Result:** ${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "isGoogleAuthPrompt" in error &&
      (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt
    ) {
      return {
        content: [
          {
            type: "text",
            text:
              (error as { message?: string }).message ||
              "Google authentication required.",
          },
        ],
      };
    }
    throw error;
  }
}
