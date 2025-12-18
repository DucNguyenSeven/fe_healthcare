export const env = {
  user: process.env.USER_SERVICE_URL!,
  chat: process.env.CHAT_SERVICE_URL!,
  nodeEnv: process.env.NODE_ENV ?? "development",
};
