import { createApiClient } from './createApiClient';
import { attachInterceptors } from './interceptors';

const api = createApiClient();
attachInterceptors(api);

export default api;
export { api };