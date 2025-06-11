import { toast } from 'vue-sonner';

interface FetchOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ResponseData<T> {
  data: T;
  message: string;
  status: number;
}

class FetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export const useFetch = () => {
  const baseURL = import.meta.env.VITE_API_URL + '/api';
  const assetsUrl = import.meta.env.VITE_ASSET_URL;

  const getAuthHeaders = (customHeaders: Record<string, string> = {}, isFormData: boolean = false) => {
    const token = localStorage.getItem('token');
    return {
      ...(isFormData ? {} : { 'Content-Type': 'application/json', 'Accept' : 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };
  };

  const handleResponse = async <T>(response: Response): Promise<ResponseData<T>> => {
    if(response.status == 401) {
      toast.error('Akses tidak sah, silakan masuk kembali');
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new FetchError(response.status, 'Unauthorized access, please log in again');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new FetchError(response.status, error.message);
    }

    return response.json();
  };

  const get = async <T>(endpoint: string, options: FetchOptions = {}): Promise<ResponseData<T>> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(options.headers),
        signal: options.signal,
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FetchError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan saat mengambil data');
      }
      throw error;
    }
  };

  const post = async <T>(endpoint: string, data: any, options: FetchOptions = {}): Promise<ResponseData<T>> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(options.headers),
        body: JSON.stringify(data),
        signal: options.signal,
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FetchError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan saat mengirim data');
      }
      throw error;
    }
  };

  const put = async <T>(endpoint: string, data: any, options: FetchOptions = {}): Promise<ResponseData<T>> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(options.headers),
        body: JSON.stringify(data),
        signal: options.signal,
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FetchError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan saat mengupdate data');
      }
      throw error;
    }
  };

  const del = async <T>(endpoint: string, options: FetchOptions = {}): Promise<ResponseData<T>> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(options.headers),
        signal: options.signal,
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FetchError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan saat menghapus data');
      }
      throw error;
    }
  };

  const postForm = async <T>(endpoint: string, formData: FormData, options: FetchOptions = {}): Promise<ResponseData<T>> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(options.headers, true),
        body: formData,
        signal: options.signal,
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FetchError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan saat mengupload file');
      }
      throw error;
    }
  };

  const putForm = async <T>(endpoint: string, formData: FormData, options: FetchOptions = {}): Promise<ResponseData<T>> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(options.headers, true),
        body: formData,
        signal: options.signal,
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FetchError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan saat mengupdate file');
      }
      throw error;
    }
  };

  const assetsURL = (path: string) => {
    return `${assetsUrl}/${path}`;
  };

  return {
    get,
    post,
    put,
    del,
    postForm,
    putForm,
    assetsURL,
  };
}; 