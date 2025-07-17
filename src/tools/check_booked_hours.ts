import { deptApiCall } from "../utils/deptApi.js";
import { CheckBookedHoursSchema } from "./schemas.js";
import { DEPT_EMPLOYEE_ID } from "../utils/env.js";

// ...existing code...
export async function check_booked_hours(args: { from: string; to: string; employeeId?: number; id?: number; idToken?: string; }): Promise<unknown> {
  const validated = CheckBookedHoursSchema.parse(args);
  const employeeId = validated.employeeId || DEPT_EMPLOYEE_ID;
  // Never get more date range than 1 week. Default from and to to Today.
  const today = new Date().toISOString().split('T')[0];
  const from = validated.from || today;
  const to = validated.to || today;
  let url = `/bookedhours/custom/${employeeId}?from=${from}&to=${to}`;
  if (validated.id) {
    url += `&id=${encodeURIComponent(validated.id)}`;
  }
  try {
    const result = await deptApiCall(url);
    // Calculate total hours for the period
    type BookedHour = { date?: string; hours?: number | string };
    let entries: BookedHour[] = [];
    if (result && typeof result === 'object' && 'result' in result && Array.isArray((result as { result?: unknown }).result)) {
      entries = (result as { result: BookedHour[] }).result;
    } else if (Array.isArray(result)) {
      entries = result as BookedHour[];
    }
    const totalHours = entries.reduce((sum: number, entry: BookedHour) => sum + (parseFloat(String(entry.hours)) || 0), 0);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    let summary = `📊 Booked Hours Summary (${formatDate(from)} to ${formatDate(to)})\n\n`;
    summary += `**Total Hours**: ${totalHours} hours\n`;
    summary += `**Number of Entries**: ${entries.length}\n\n`;
    if (Array.isArray(entries) && entries.length > 0) {
      summary += `**Daily Breakdown**:\n`;
      const byDate: Record<string, BookedHour[]> = {};
      entries.forEach((entry: BookedHour) => {
        const date = entry.date?.split('T')[0] || 'Unknown';
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(entry);
      });
      Object.keys(byDate).sort().forEach(date => {
        const dayHours = byDate[date].reduce((sum: number, entry: BookedHour) => sum + (parseFloat(String(entry.hours)) || 0), 0);
        summary += `• ${formatDate(date)}: ${dayHours} hours (${byDate[date].length} entries)\n`;
      });
    } else {
      summary += `❌ No hours booked in this period.\n`;
    }
    return {
      content: [
        {
          type: "text",
          text: summary + `\n**Full Details**:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
      return {
        content: [
          {
            type: "text",
            text: (error as { message?: string }).message || "Google authentication required.",
          },
        ],
      };
    }
    throw error;
  }
}
