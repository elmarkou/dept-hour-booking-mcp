export interface Budget {
  id: number;
  name?: string;
  budgetType?: number;
  companyId?: number;
  companyNameShort?: string;
  hours?: number;
  projectId?: number;
  projectName?: string;
  spendHours?: number;
  hoursLeft?: number;
  activityId?: number;
  activityLevel?: number | null;
  groupName?: string | null;
  corporationId?: number;
  startDate?: string | null;
  endDate?: string | null;
  isProjectTaskMandatory?: boolean;
  [key: string]: unknown;
}
export interface Repeat {
  days: Record<string, boolean>;
  until: string;
}

export interface BookedHour {
  id: string | number;
  employeeId?: number;
  date?: string;
  description?: string;
  hours?: number | string;
  repeat?: Repeat;
  isLocked?: boolean;
  activityId?: number;
  activityName?: string;
  budgetId?: number;
  budgetName?: string;
  companyId?: number;
  companyName?: string;
  employeeDisplayName?: string;
  corporationId?: number;
  projectId?: number;
  projectName?: string;
  roleId?: number;
  serviceDeskTicketNumber?: string | null;
  serviceDeskTicketPriority?: string | null;
  canEdit?: boolean;
  projectTaskId?: number | null;
  budgetGroupName?: string;
  timeBookingTypeId?: number;
  projectCategory?: string;
  dates?: Record<string, string> | null;
  isVacation?: boolean;
}
export interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  client_id: string;
  ".issued": string;
  ".expires": string;
}
