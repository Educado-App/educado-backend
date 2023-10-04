const regexPatterns = {
  email: /^[a-z0-9!'#$%&*+\/=?^_`{|}~-]+(?:\.[a-z0-9!'#$%&*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-zA-Z]{2,}$/i,
  name: /^(\p{L}+[ -'])*\p{L}+$/u,
}

module.exports = Object.freeze({
  patterns: regexPatterns,
});