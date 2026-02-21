import axios from 'axios';

// Use relative /api so browser hits same origin; Next.js rewrites proxy to the backend (avoids CORS/network errors)
const getBaseURL = () => process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Setup token refresh timer
let refreshTimer: NodeJS.Timeout | null = null;

const scheduleTokenRefresh = () => {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const tokenExpiry = localStorage.getItem('tokenExpiry');
  if (!tokenExpiry) return;

  const expiryTime = parseInt(tokenExpiry);
  const currentTime = Date.now();
  const timeUntilExpiry = expiryTime - currentTime;

  // Refresh 5 minutes before expiry (or immediately if less than 5 minutes left)
  const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

  refreshTimer = setTimeout(async () => {
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('Proactive token refresh failed:', error);
    }
  }, refreshTime);
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(
    `${getBaseURL()}/auth/refresh`,
    { refreshToken }
  );

  const { accessToken, expiresIn } = response.data;
  
  // Store new token and expiry time
  localStorage.setItem('accessToken', accessToken);
  const expiryTime = Date.now() + (expiresIn || 3600) * 1000;
  localStorage.setItem('tokenExpiry', expiryTime.toString());

  // Schedule next refresh
  scheduleTokenRefresh();

  return accessToken;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api-client.ts:request-interceptor',message:'API request',data:{url:config.url,method:config.method,hasToken:!!token,baseURL:config.baseURL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    }
    // #endregion
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api-client.ts:response-error',message:'API error',data:{status:error.response?.status,url:error.config?.url,message:error.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    }
    // #endregion
    
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh failed, clear auth data and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        
        // Use the correct login path
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Network Error = API not reachable (proxy target down or wrong)
    const baseURL = getBaseURL();
    if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
      error.apiHint = `Cannot reach API. Start the backend: in apps/api run "pnpm run start:dev" (default: ${baseURL === '/api' ? 'http://127.0.0.1:3001/api via proxy' : baseURL}).`;
    }
    return Promise.reject(error);
  }
);

// Initialize token refresh scheduling on module load
if (typeof window !== 'undefined') {
  scheduleTokenRefresh();
  
  // Re-schedule on visibility change (when user comes back to the tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry && parseInt(tokenExpiry) < Date.now()) {
        // Token expired while tab was hidden, refresh immediately
        refreshAccessToken().catch(() => {
          window.location.href = '/login';
        });
      } else {
        scheduleTokenRefresh();
      }
    }
  });
}

export default apiClient;
