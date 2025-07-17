import { deptApiCall } from "../utils/deptApi.js";
import { SearchInternalBudgetsSchema } from "../tools/schemas.js";
import { Budget } from '../utils/types.js';

export async function search_internal_budgets(args: { searchTerm: string }) {
  const validated = SearchInternalBudgetsSchema.parse(args);

   try {
      const result = await deptApiCall(
        `/budgets/search/internal?searchTerm=${encodeURIComponent(validated.searchTerm)}`
      );
      // Handle different response formats
      let budgets: Budget[] = [];
      if (Array.isArray(result)) {
        budgets = result as Budget[];
      } else if (result && typeof result === 'object') {
        if ('data' in result && Array.isArray((result as { data?: unknown }).data)) {
          budgets = (result as { data: Budget[] }).data;
        } else if ('budgets' in result && Array.isArray((result as { budgets?: unknown }).budgets)) {
          budgets = (result as { budgets: Budget[] }).budgets;
        }
      }
      return {
        content: [
          {
            type: "text",
            text: `🔍 Found ${budgets.length} internal budgets matching "${validated.searchTerm}"\n\n${budgets.map((budget: Budget, index: number) => `${index + 1}. ${budget.name || 'Unnamed Budget'} (ID: ${budget.id})`).join('\n')}\n\nFull results:\n${JSON.stringify(result, null, 2)}`,
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
