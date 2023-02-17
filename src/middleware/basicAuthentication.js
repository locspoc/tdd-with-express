const bcrypt = require('bcrypt');
const UserService = require('../user/UserService');
const ForbiddenException = require('../error/ForbiddenException');

const basicAuthentication = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    // if there is not authorization header return forbidden
    return next(new ForbiddenException('unauthorized_user_update'));
  }
  const encoded = authorization.substring(6);
  const decoded = Buffer.from(encoded, 'base64').toString('ascii');
  const [email, password] = decoded.split(':');
  const user = await UserService.findByEmail(email);
  if (user && !user.inactive) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.authenticatedUser = user;
    }
  }
  next();
};

module.exports = basicAuthentication;
