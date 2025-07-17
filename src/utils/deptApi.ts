import { ApiOptions } from "./types.js";
import { getValidAccessToken } from "./token.js";
import fetch from "node-fetch";

const { DEPT_API_BASE_URL } = process.env;

export async function deptApiCall(path: string, options: ApiOptions = {}) {
  const accessToken = await getValidAccessToken();
  const baseUrl = DEPT_API_BASE_URL?.endsWith('/') ? DEPT_API_BASE_URL.slice(0, -1) : DEPT_API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  try {
    const response = await fetch(url, { ...options, headers });
    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (response.status !== 204 && contentType && contentType.includes('application/json')) {
      data = await response.json();
    }
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
    }
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
