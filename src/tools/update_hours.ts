import { deptApiCall } from "../utils/deptApi.js";
import { UpdateHoursSchema } from "./schemas.js";
import type { BookedHour } from "../utils/types.js";
import { holidayKeywords, personalKeywords } from '../utils/personal.js';
import { resolveBudgetForDescription } from '../utils/resolveBudget.js';

import { DEPT_CORPORATION_ID } from '../utils/env.js';

// ...existing code...
export interface UpdateHoursArgs {
  id: number;
  hours?: number;
  date?: string;
  description?: string;
  budgetId?: number;
  budgetName?: string;
  activityId?: number;
  activityName?: string;
  projectId?: number;
  projectName?: string;
  companyId?: number;
  isVacation?: boolean;
  idToken?: string;
}

export async function update_hours(args: UpdateHoursArgs): Promise<unknown> {
  const validated = UpdateHoursSchema.parse(args);
  // Step 1: Fetch existing record using check_booked_hours (since direct GET is deprecated)
  const { DEPT_EMPLOYEE_ID, DEPT_DEFAULT_ACTIVITY_ID, DEPT_DEFAULT_BUDGET_ID, DEPT_DEFAULT_COMPANY_ID, DEPT_DEFAULT_PROJECT_ID } = await import("../utils/env.js");
  const checkResult = await deptApiCall(`/bookedhours/custom/${DEPT_EMPLOYEE_ID}?from=2000-01-01&to=2100-01-01&id=${encodeURIComponent(validated.id)}`);
  let existingRecord: BookedHour | null = null;
  if (checkResult && typeof checkResult === 'object' && 'result' in checkResult && Array.isArray((checkResult as { result?: unknown }).result)) {
    existingRecord = (checkResult as { result: BookedHour[] }).result.find((entry: BookedHour) => Number(entry.id) === Number(validated.id)) || null;
  }
  if (!existingRecord) {
    throw new Error(`Time booking with ID ${validated.id} not found`);
  }
  if (existingRecord.isLocked || !existingRecord.canEdit) {
    throw new Error('Cannot update hours: budget is locked.');
  }
  const desc = validated.description || existingRecord.description;

  let budgetId = validated.budgetId || existingRecord.budgetId;
  let budgetName = validated.budgetName || existingRecord.budgetName;
  let activityId = validated.activityId || existingRecord.activityId;
  let activityName = validated.activityName || existingRecord.activityName;
  let projectId = validated.projectId || existingRecord.projectId;
  let projectName = validated.projectName || existingRecord.projectName;
  let companyId = validated.companyId || existingRecord.companyId;
  let isVacation = validated.isVacation || existingRecord.isVacation || false;

  const budgetResolution = await resolveBudgetForDescription({
    description: desc,
    corporationId: existingRecord.corporationId,
    holidayKeywords,
    personalKeywords,
    DEPT_DEFAULT_BUDGET_ID,
    DEPT_CORPORATION_ID,
  });
  
  budgetId = budgetId || (budgetResolution.budgetId !== undefined ? Number(budgetResolution.budgetId) : undefined);
  budgetName = budgetName || (budgetResolution.activityName || "Default Budget");
  activityId = activityId || (budgetResolution.activityId !== undefined ? Number(budgetResolution.activityId) : undefined);
  activityName = activityName || budgetResolution.activityName;
  projectId = projectId || (budgetResolution.projectId !== undefined ? Number(budgetResolution.projectId) : undefined);
  projectName = projectName || budgetResolution.projectName;
  companyId = companyId || (budgetResolution.companyId !== undefined ? Number(budgetResolution.companyId) : undefined);
  isVacation = isVacation || budgetResolution.isVacation || false;

  
  // Step 2: Create update data by merging existing record with provided changes
  const updateData: BookedHour = {
    employeeId: existingRecord.employeeId || parseInt(DEPT_EMPLOYEE_ID || '0'),
    id: validated.id,
    date: validated.date || existingRecord.date,
    description: desc,
    hours: validated.hours !== undefined ? validated.hours.toString() : existingRecord.hours?.toString(),
    repeat: existingRecord.repeat || {
      days: {},
      until: `${validated.date || existingRecord.date || new Date().toISOString().split('T')[0]}T22:00:00.000Z`
    },
    isLocked: existingRecord.isLocked || false,
    activityId: activityId || parseInt(DEPT_DEFAULT_ACTIVITY_ID || '0'),
    activityName: activityName || "Implementation",
    budgetId: budgetId || parseInt(DEPT_DEFAULT_BUDGET_ID || '0'),
    budgetName: budgetName || "Default Budget",
    companyId: companyId || parseInt(DEPT_DEFAULT_COMPANY_ID || '0'),
    companyName: existingRecord.companyName || "Default Company",
    employeeDisplayName: existingRecord.employeeDisplayName || "Employee",
    projectId: projectId || parseInt(DEPT_DEFAULT_PROJECT_ID || '0'),
    projectName: projectName || "Default Project",
    roleId: existingRecord.roleId || 33,
    canEdit: existingRecord.canEdit !== undefined ? existingRecord.canEdit : true,
    projectTaskId: existingRecord.projectTaskId || null,
    budgetGroupName: existingRecord.budgetGroupName || "Default Budget Group",
    timeBookingTypeId: existingRecord.timeBookingTypeId || 1,
    projectCategory: existingRecord.projectCategory || "Client",
    dates: existingRecord.dates || null,
    isVacation: isVacation || holidayKeywords.some(k => desc.includes(k)) || false
  };
  // Step 3: Validate merged result (basic validation)
  if (!updateData.date) {
    throw new Error('Date is required and could not be determined from existing record');
  }
  if (!updateData.description) {
    throw new Error('Description is required and could not be determined from existing record');
  }
  if (!updateData.hours) {
    throw new Error('Hours is required and could not be determined from existing record');
  }
  // Step 4: Save updated record
  try {
    console.log("Budget Resolution:", budgetResolution);
    console.log("Update data:", updateData);
    const result = await deptApiCall(`/bookedhours/${validated.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    // Prepare change summary for user feedback
    const changes = [];
    if (validated.hours !== undefined) {
      changes.push(`- Hours: ${existingRecord.hours} → ${validated.hours}`);
    }
    if (validated.date) {
      changes.push(`- Date: ${existingRecord.date} → ${validated.date}`);
    }
    if (validated.description) {
      changes.push(`- Description: "${existingRecord.description}" → "${validated.description}"`);
    }
    if (validated.activityName && validated.activityName !== existingRecord.activityName) {
      changes.push(`- Activity Name: "${existingRecord.activityName}" → "${validated.activityName}"`);
    }
    if (projectName !== existingRecord.projectName) {
      changes.push(`- Project Name: "${existingRecord.projectName}" → "${validated.projectName}"`);
    }
    if (activityId !== existingRecord.activityId) {
      changes.push(`- Activity: ${existingRecord.activityName || existingRecord.activityId} → ${activityName || activityId}`);
    }
    if (budgetId !== existingRecord.budgetId) {
      changes.push(`- Budget: ${existingRecord.budgetName || existingRecord.budgetId} → ${updateData.budgetName || budgetId}`);
    }
    if (isVacation !== existingRecord.isVacation) {
      changes.push(`- isVacation: ${existingRecord.isVacation ? "Yes" : "No"} → ${isVacation ? "Yes" : "No"}`);
    }
    if (projectId !== existingRecord.projectId) {
      changes.push(`- Project: ${existingRecord.projectName || existingRecord.projectId} → ${updateData.projectName || projectId}`);
    }
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully updated booking ${validated.id}\n\n${changes.length > 0 ? `Changes made:\n${changes.join('\n')}\n\n` : 'No changes were made.\n\n'}Preserved fields:\n- All other fields maintained their original values\n\nUpdated record: ${JSON.stringify(result, null, 2)}`,
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
