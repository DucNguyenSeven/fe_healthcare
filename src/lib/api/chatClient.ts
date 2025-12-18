import { createChatClient } from './createChatClient';
import { attachInterceptors } from './interceptors';

const chatApi = createChatClient();
attachInterceptors(chatApi);

export default chatApi;
export { chatApi };
