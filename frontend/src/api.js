import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = {
  getSummary: () => axios.get(`${API_BASE_URL}/analytics/summary`),
  getBooks: () => axios.get(`${API_BASE_URL}/books`),
  getBooksPaginated: (skip = 0, limit = 10, search = '') => axios.get(`${API_BASE_URL}/books/paginated?skip=${skip}&limit=${limit}&search=${search}`),
  createBook: (bookData) => axios.post(`${API_BASE_URL}/books`, bookData),
  updateBook: (id, bookData) => axios.put(`${API_BASE_URL}/books/${id}`, bookData),
  deleteBook: (id) => axios.delete(`${API_BASE_URL}/books/${id}`),
  getMembers: () => axios.get(`${API_BASE_URL}/members`),
  createMember: (memberData) => axios.post(`${API_BASE_URL}/members`, memberData),
  issueBook: (bookId, memberId) => axios.post(`${API_BASE_URL}/transactions/issue?book_id=${bookId}&member_id=${memberId}`),
  returnBook: (transactionId) => axios.post(`${API_BASE_URL}/transactions/return/${transactionId}`),
  getRecentTransactions: () => axios.get(`${API_BASE_URL}/analytics/recent`),
  getSummary: () => axios.get(`${API_BASE_URL}/analytics/summary`),
};



export default api;
