const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;

const JWT_SECRET = process.env.JWT_SECRET;

const FAST2SMS = process.env.FAST2SMS;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
module.exports = {
  PORT,
  MONGODB_URI,
  NODE_ENV,
  JWT_SECRET,
  FAST2SMS,
  SENDGRID_API_KEY,
};
