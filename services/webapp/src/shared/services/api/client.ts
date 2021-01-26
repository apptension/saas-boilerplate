import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

const baseUrl = process.env.REACT_APP_BASE_API_URL;

if (!baseUrl) {
  throw new Error('REACT_APP_BASE_API_URL env is missing');
}

export const client = applyCaseMiddleware(axios.create({
  baseURL: baseUrl,
}));
