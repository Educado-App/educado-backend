module.exports = function makeFakeResetPasswordToken(token='1234') {
  return {
    token: token,
    expiresAt: new Date() + 1000 * 60 * 60 * 24 * 7,
  };
};