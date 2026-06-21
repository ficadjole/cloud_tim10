const BLOB_BASE_URL =
  import.meta.env.VITE_BLOB_BASE_URL ??
  "http://127.0.0.1:10000/devstoreaccount1/manual-readings-images/";

export const getImageUrl = (path: string) => `${BLOB_BASE_URL}${path}`;