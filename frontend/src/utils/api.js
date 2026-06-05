import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post(`${API.defaults.baseURL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return API(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (d) => API.post('/auth/register/', d),
  login: (d) => API.post('/auth/login/', d),
  logout: (refresh) => API.post('/auth/logout/', { refresh }),
  getProfile: () => API.get('/auth/profile/'),
  updateProfile: (d) => API.patch('/auth/profile/', d),
  changePassword: (d) => API.post('/auth/change-password/', d),
};

// Buses
export const busAPI = {
  searchTrips: (params) => API.get('/buses/search/', { params }),
  getTripDetail: (id) => API.get(`/buses/trips/${id}/`),
  getRoutes: () => API.get('/buses/routes/'),
  getPopularRoutes: () => API.get('/buses/popular-routes/'),
};

// Bookings
export const bookingAPI = {
  createBooking: (d) => API.post('/bookings/create/', d),
  getMyBookings: () => API.get('/bookings/my-bookings/'),
  getBookingDetail: (id) => API.get(`/bookings/${id}/`),
  cancelBooking: (id, reason) => API.post(`/bookings/${id}/cancel/`, { reason }),
  downloadTicket: (id) => API.get(`/bookings/${id}/download-ticket/`, { responseType: 'blob' }),
};

// Reviews
export const reviewAPI = {
  addReview: (d) => API.post('/bookings/reviews/add/', d),
  getBusReviews: (busId) => API.get(`/bookings/reviews/bus/${busId}/`),
};

// Promo Code
export const promoAPI = {
  validate: (code, amount) => API.post('/bookings/promo/validate/', { code, amount }),
};

// Loyalty Points
export const loyaltyAPI = {
  getPoints: () => API.get('/bookings/loyalty/'),
};

// Notifications
export const notificationAPI = {
  getAll: () => API.get('/bookings/notifications/'),
  markAllRead: () => API.patch('/bookings/notifications/'),
  markRead: (id) => API.patch(`/bookings/notifications/${id}/read/`),
};

// Payments
export const paymentAPI = {
  initiatePayment: (d) => API.post('/payments/initiate/', d),
  getHistory: () => API.get('/payments/history/'),
};

// Admin
export const adminAPI = {
  getAllBookings: () => API.get('/bookings/admin/all/'),
  getAllPayments: () => API.get('/payments/admin/all/'),
  getBuses: () => API.get('/buses/admin/buses/'),
  createBus: (d) => API.post('/buses/admin/buses/', d),
  updateBus: (id, d) => API.put(`/buses/admin/buses/${id}/`, d),
  deleteBus: (id) => API.delete(`/buses/admin/buses/${id}/`),
  getRoutes: () => API.get('/buses/admin/routes/'),
  createRoute: (d) => API.post('/buses/admin/routes/', d),
  getSchedules: () => API.get('/buses/admin/schedules/'),
  createSchedule: (d) => API.post('/buses/admin/schedules/', d),
  getTrips: () => API.get('/buses/admin/trips/'),
  createTrip: (d) => API.post('/buses/admin/trips/', d),
  generateSeats: (busId) => API.post(`/buses/admin/buses/${busId}/generate-seats/`),
};

export default API;