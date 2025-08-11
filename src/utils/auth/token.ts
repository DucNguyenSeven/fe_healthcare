type TokenPair = { accessToken?: string; refreshToken?: string } | null;
let _tokens: TokenPair = null;

export const tokenStore = {
  set(tokens: TokenPair) { _tokens = tokens; },
  get(): TokenPair { return _tokens; },
  clear() { _tokens = null; },
};
