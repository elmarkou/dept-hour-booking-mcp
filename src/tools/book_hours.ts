import { deptApiCall } from "../utils/deptApi.js";
// @ts-ignore
import { BookHoursSchema } from "./schemas.js";
// @ts-ignore
import {
  DEPT_CORPORATION_ID,
  DEPT_DEFAULT_BUDGET_ID,
  DEPT_EMPLOYEE_ID,
  DEPT_DEFAULT_ACTIVITY_ID,
  DEPT_DEFAULT_COMPANY_ID,
  DEPT_DEFAULT_PROJECT_ID,
} from "../utils/env.js";
import { holidayKeywords, personalKeywords } from "../utils/personal.js";
import { resolveBudgetForDescription } from '../utils/resolveBudget.js';

export interface BookHoursArgs {
  hours: number;
  date: string;
  description: string;
  budgetId?: number;
  idToken?: string;
  activityName?: string;
  activityId?: number;
  projectId?: number;
  companyId?: number;
  corporationId?: string;
  employeeId?: number;
  isVacation?: boolean;
}

export async function book_hours(args: BookHoursArgs): Promise<unknown> {
  const validated = BookHoursSchema.parse(args);
  let budgetId = validated.budgetId;
  let activityId = validated.activityId;
  let activityName = validated.activityName;
  let projectId = validated.projectId;
  let companyId = validated.companyId;
  let corporationId = validated.corporationId;
  let isVacation = validated.isVacation || false;

  const budgetResolution = await resolveBudgetForDescription({
    description: validated.description,
    corporationId: validated.corporationId,
    holidayKeywords,
    personalKeywords,
    DEPT_DEFAULT_BUDGET_ID,
    DEPT_CORPORATION_ID,
  });

  budgetId = budgetId || (budgetResolution.budgetId !== undefined ? Number(budgetResolution.budgetId) : undefined);
  activityId = activityId || (budgetResolution.activityId !== undefined ? Number(budgetResolution.activityId) : undefined);
  activityName = activityName || budgetResolution.activityName;
  projectId = projectId || (budgetResolution.projectId !== undefined ? Number(budgetResolution.projectId) : undefined);
  companyId = companyId || (budgetResolution.companyId !== undefined ? Number(budgetResolution.companyId) : undefined);
  corporationId = corporationId || (budgetResolution.corporationId !== undefined ? Number(budgetResolution.corporationId) : undefined);
  isVacation = isVacation || budgetResolution.isVacation || false;

  if (!budgetId) {
    throw new Error("Budget ID is required and could not be determined");
  }

  const bookingData = {
    employeeId: validated.employeeId || DEPT_EMPLOYEE_ID,
    hours: validated.hours,
    date: validated.date,
    description: validated.description,
    repeat: { days: {}, until: `${validated.date}T22:00:00.000Z` },
    isLocked: false,
    activityName: activityName || undefined,
    activityId: activityId || DEPT_DEFAULT_ACTIVITY_ID,
    corporationId: corporationId || DEPT_CORPORATION_ID,
    companyId: companyId || DEPT_DEFAULT_COMPANY_ID,
    projectId: projectId || DEPT_DEFAULT_PROJECT_ID,
    budgetId: budgetId,
    isVacation: isVacation || false,
  };

  const result = await deptApiCall("/bookedhours", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
  let bookingId = "N/A";
  if (result && typeof result === "object" && "id" in result) {
    bookingId = (result as { id?: string }).id || "N/A";
  }
  return {
    content: [
      {
        type: "text",
        text: `✅ Successfully booked ${validated.hours} hours for ${
          validated.date
        }\n\nDetails:\n- Description: ${
          validated.description
        }\n- Budget ID: ${budgetId}\n- Booking ID: ${bookingId}\n\nResult: ${JSON.stringify(
          result,
          null,
          2
        )}`,
      },
    ],
  };
}
