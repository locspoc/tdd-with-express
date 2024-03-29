const express = require('express');
const UserRouter = require('./user/UserRouter');
const AuthenticationRouter = require('./auth/AuthenticationRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const errorHandler = require('./error/ErrorHandler');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lgn: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

const app = express();

// console.log('app: ', app);

// app.listen(3000, () => console.log('app is running!'));

app.use(middleware.handle(i18next));

app.use(express.json());

app.use(UserRouter);
app.use(AuthenticationRouter);

app.use(errorHandler);

module.exports = app;
