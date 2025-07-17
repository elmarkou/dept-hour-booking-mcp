import { deptApiCall } from "../utils/deptApi.js";
import { BookHoursBulkSchema } from "./schemas.js";
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

export interface BookHoursBulkArgs {
  hours: number;
  startDate: string;
  endDate: string;
  description: string;
  budgetId: number;
  weekdays?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
  };
  idToken?: string;
  activityName?: string;
  employeeId?: number;
  activityId?: number;
  projectId?: number;
  companyId?: number;
  corporationId?: number;
  isVacation?: boolean;
}

export async function book_hours_bulk(args: BookHoursBulkArgs): Promise<unknown> {
  const validated = BookHoursBulkSchema.parse(args);
  let budgetId = validated.budgetId;
  let activityName = validated.activityName;
  let activityId = validated.activityId;
  let projectId = validated.projectId;
  let companyId = validated.companyId;
  let corporationId = validated.corporationId;
  let isVacation = validated.isVacation || false;

  // DRY: Use shared budget resolution utility
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
  const generateDates = (
    startDate: string,
    endDate: string,
    weekdays: Record<string, boolean>
  ) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const selectedDays = Object.entries(weekdays || {})
      .filter(([, selected]) => selected)
      .map(([day]) => dayMap[day as keyof typeof dayMap]);
    if (selectedDays.length === 0) {
      selectedDays.push(1, 2, 3, 4, 5);
    }
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        dates.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  const targetDates = generateDates(
    validated.startDate,
    validated.endDate,
    validated.weekdays
  );
  if (targetDates.length === 0) {
    throw new Error(
      "No valid dates found for the specified range and weekday selection"
    );
  }
  const daysMap: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };
  const repeatDays: Record<string, boolean> = {};
  Object.entries(validated.weekdays || {}).forEach(([day, selected]) => {
    if (selected && daysMap[day] !== undefined) {
      repeatDays[daysMap[day].toString()] = true;
    }
  });
  if (Object.keys(repeatDays).length === 0) {
    repeatDays["1"] = true;
    repeatDays["2"] = true;
    repeatDays["3"] = true;
    repeatDays["4"] = true;
    repeatDays["5"] = true;
  }
  const bulkBookingData = {
    employeeId: validated.employeeId || DEPT_EMPLOYEE_ID,
    hours: validated.hours.toString(),
    date: validated.startDate,
    description: validated.description,
    repeat: {
      days: repeatDays,
      until: `${validated.endDate}T22:00:00.000Z`,
    },
    isLocked: false,
    activityName: activityName || null,
    activityId: activityId || DEPT_DEFAULT_ACTIVITY_ID,
    corporationId: corporationId || DEPT_CORPORATION_ID,
    companyId: companyId || DEPT_DEFAULT_COMPANY_ID,
    projectId: projectId || DEPT_DEFAULT_PROJECT_ID,
    budgetId: budgetId,
    dates: targetDates,
    isVacation: isVacation,
  };
  const result = await deptApiCall("/bookedhours/bulk", {
    method: "POST",
    body: JSON.stringify(bulkBookingData),
  });
  const dayNames = Object.entries(validated.weekdays || {})
    .filter(([, selected]) => selected)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
  const selectedDaysText =
    dayNames.length > 0 ? dayNames.join(", ") : "Monday-Friday";
  return {
    content: [
      {
        type: "text",
        text: `✅ Successfully booked ${
          validated.hours
        } hours per day in bulk\n\nDetails:\n- Date Range: ${
          validated.startDate
        } to ${validated.endDate}\n- Days: ${selectedDaysText}\n- Total Days: ${
          targetDates.length
        }\n- Total Hours: ${
          validated.hours * targetDates.length
        }\n- Description: ${
          validated.description
        }\n- Budget ID: ${budgetId}\n\nDates booked: ${targetDates.join(
          ", "
        )}\n\nResult: ${JSON.stringify(result, null, 2)}`,
      },
    ],
  };
}
