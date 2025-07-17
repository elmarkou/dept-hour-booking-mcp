import { deptApiCall } from "./deptApi.js";
import { Budget } from "./types.js";

export interface BudgetResolution {
  budgetId?: number;
  activityId?: number;
  activityName?: string;
  projectId?: number;
  projectName?: string;
  companyId?: number;
  corporationId?: number;
  isVacation?: boolean;
}

export interface ResolveBudgetForDescriptionArgs {
  description: string;
  corporationId?: number;
  holidayKeywords: string[];
  personalKeywords: string[];
  DEPT_DEFAULT_BUDGET_ID: string;
  DEPT_CORPORATION_ID: string;
}

export async function resolveBudgetForDescription({
  description,
  corporationId,
  holidayKeywords,
  personalKeywords,
  DEPT_DEFAULT_BUDGET_ID,
  DEPT_CORPORATION_ID,
}: ResolveBudgetForDescriptionArgs): Promise<BudgetResolution> {
  const desc = (description || "").toLowerCase();
  const isPersonal = personalKeywords.some((k) => desc.includes(k));
  let result: BudgetResolution = {};
  if (isPersonal) {
    try {
      const internalBudgetsRaw = await deptApiCall(
        `/budgets/search/internal?searchTerm=${encodeURIComponent(description)}`
      );
      const internalBudgets = internalBudgetsRaw as { budgets?: Budget[] };
      if (
        internalBudgets &&
        Array.isArray(internalBudgets.budgets) &&
        internalBudgets.budgets.length > 0
      ) {
        const b = internalBudgets.budgets[0];
        result = {
          budgetId: b.id,
          activityId: b.activityId,
          activityName: b.name,
          projectId: b.projectId,
          projectName: b.projectName,
          companyId: b.companyId,
          corporationId: b.corporationId,
          isVacation: holidayKeywords.some((k) => desc.includes(k)),
        };
      }
    } catch {
      // fallback
    }
  }
  if (!result.budgetId && description) {
    try {
      const searchData = await deptApiCall(
        `/budgets/search?searchTerm=${encodeURIComponent(
          description
        )}&corporationId=${corporationId || DEPT_CORPORATION_ID}`
      );
      if (Array.isArray(searchData) && searchData.length > 0) {
        result.budgetId =
          typeof searchData[0].id === "number"
            ? searchData[0].id
            : Number(searchData[0].id);
      } else {
        result.budgetId = Number(DEPT_DEFAULT_BUDGET_ID);
      }
    } catch {
      result.budgetId = Number(DEPT_DEFAULT_BUDGET_ID);
    }
  }
  return result;
}
