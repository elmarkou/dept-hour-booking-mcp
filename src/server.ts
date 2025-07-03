import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const {
    API_BASE_URL,
    BEARER_TOKEN,
    EMPLOYEE_ID,
    CORPORATION_ID,
    DEFAULT_ACTIVITY_ID,
    DEFAULT_PROJECT_ID,
    DEFAULT_COMPANY_ID,
    DEFAULT_BUDGET_ID
} = process.env;

console.log(`Using token starting with: ${BEARER_TOKEN?.substring(0, 4)}... and ending with: ${BEARER_TOKEN?.slice(-4)}`);

const api = (path: string, options: any, useBudgetToken = false) => {
    const baseUrl = API_BASE_URL?.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${baseUrl}${cleanPath}`;
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
    };
    console.log(`Making ${options.method || 'GET'} request to: ${url}`);
    console.log(`Using BEARER_TOKEN: ${BEARER_TOKEN?.substring(0, 10)}...${BEARER_TOKEN?.slice(-10)}`);
    return fetch(url, { ...options, headers });
};

app.post('/bookhours', async (req: Request, res: Response) => {
    let {
        employeeId = EMPLOYEE_ID,
        hours,
        date,
        description,
        repeat,
        isLocked = false,
        activityId = DEFAULT_ACTIVITY_ID,
        companyId = DEFAULT_COMPANY_ID,
        corporationId = CORPORATION_ID,
        projectId = DEFAULT_PROJECT_ID,
        budgetId
    } = req.body;

    if (!budgetId && description) {
        try {
            const searchResponse = await api(`/budgets/search?searchTerm=${encodeURIComponent(description)}&corporationId=${corporationId}`, { method: 'GET' }, true);
            const searchData: any = await searchResponse.json();
            if (searchData && searchData.length > 0) {
                budgetId = searchData[0].id;
            } else {
                budgetId = DEFAULT_BUDGET_ID; // Use default if not found
            }
        } catch (error) {
            console.error(error);
            budgetId = DEFAULT_BUDGET_ID; // Use default on error
        }
    } else if (!budgetId) {
        budgetId = DEFAULT_BUDGET_ID; // Use default if no budgetId or description
    }

    if (!budgetId) {
        return res.status(400).json({ error: 'Budget ID is required and could not be determined.' });
    }

    const body = {
        employeeId,
        hours,
        date,
        description,
        repeat,
        isLocked,
        activityId,
        companyId,
        corporationId,
        projectId,
        budgetId
    };

    try {
        const response = await api('/bookedhours', {
            method: 'POST',
            body: JSON.stringify(body),
        }, true);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to book hours.' });
    }
});

app.put('/updatehours/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Merge with default values and the specific structure that works in the browser
    const {
        employeeId = EMPLOYEE_ID,
        hours = "1", // Default to 1 hour if not provided
        date = "2025-07-03", // Always provide a date
        description,
        repeat = { days: {}, until: `${date || '2025-07-03'}T22:00:00.000Z` },
        isLocked = false,
        activityId = DEFAULT_ACTIVITY_ID,
        activityName = "Implementation",
        budgetId = DEFAULT_BUDGET_ID,
        budgetName = "Lead Developer - July",
        companyId = DEFAULT_COMPANY_ID,
        companyName = "Mast-Jägermeister SE",
        employeeDisplayName = "Elmar Kouwenhoven",
        projectId = DEFAULT_PROJECT_ID,
        projectName = "NDH Global Maintenance 2025",
        roleId = 33,
        serviceDeskTicketNumber = null,
        serviceDeskTicketPriority = "",
        canEdit = true,
        projectTaskId = null,
        budgetGroupName = "NDH Global Retainer July 2025",
        timeBookingTypeId = 1,
        projectCategory = "Client",
        dates = null
    } = req.body;

    const updatedBooking = {
        employeeId: parseInt(employeeId),
        date,
        description,
        repeat,
        isLocked,
        id: parseInt(id, 10),
        activityId: parseInt(activityId),
        activityName,
        budgetId: parseInt(budgetId),
        budgetName,
        companyId: parseInt(companyId),
        companyName,
        employeeDisplayName,
        projectId: parseInt(projectId),
        projectName,
        roleId: parseInt(roleId),
        serviceDeskTicketNumber,
        serviceDeskTicketPriority,
        canEdit,
        projectTaskId,
        budgetGroupName,
        timeBookingTypeId: parseInt(timeBookingTypeId),
        projectCategory,
        hours: hours?.toString(), // Convert to string and put at the end like in browser!
        dates
    };

    console.log('Updating booking with payload:', JSON.stringify(updatedBooking, null, 2));

    try {
        const response = await api(`/bookedhours/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedBooking),
        }, true);
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update hours.' });
    }
});

app.get('/searchbudget', async (req: Request, res: Response) => {
    const { term } = req.query;
    if (!term) {
        return res.status(400).json({ error: 'Search term is required.' });
    }

    try {
        const response = await api(`/budgets/search?searchTerm=${encodeURIComponent(term as string)}&corporationId=${CORPORATION_ID}`, { method: 'GET' }, true);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search for budget.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});