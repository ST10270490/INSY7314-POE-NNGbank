// Backend/enums.js
const Status = {
  Pending: 'Pending',
  Verified: 'Completed',
  Failed: 'Failed',
  InternalError: 'InternalError', // backend-only
};

module.exports = { Status };