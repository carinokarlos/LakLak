export const API_URL = "http://YOUR_LOCAL_IP:8000";
// example: "http://192.168.1.5:8000"

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    return res.json();
};