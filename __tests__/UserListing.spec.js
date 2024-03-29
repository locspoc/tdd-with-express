/**
 * User Listing Specifciations
 */

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
// const { describe } = require('../src/user/User');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');

beforeAll(async () => {
  await sequelize.sync();

  jest.setTimeout(10000);
});

beforeEach(async () => {
  await User.destroy({ truncate: true });
});

const getUsers = () => {
  return request(app).get('/api/1.0/users');
};

const addUsers = async (activeUserCount, inactiveUserCount = 0) => {
  for (let i = 0; i < activeUserCount + inactiveUserCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      inactive: i > activeUserCount - 1,
    });
  }
};

describe('Listing Users', () => {
  it('returns 200 ok when there are no users in the database', async () => {
    const response = await request(app).get('/api/1.0/users');
    // console.log('response.status: ', response.status);
    expect(response.status).toBe(200);
  });
  it('returns page object as response body', async () => {
    const response = await getUsers();
    expect(response.body).toEqual({
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
    });
  });
  it('returns 10 users in page content when there are 11 users in database', async () => {
    await addUsers(11);
    const response = await request(app).get('/api/1.0/users');
    expect(response.body.content.length).toBe(10);
  });
  it('returns 6 users in page content when there are active 6 users and inactive 5 users in database', async () => {
    await addUsers(6, 5);
    const response = await getUsers();
    // console.log(response.body.content[0]);
    // console.log(response.body.content.length);
    // console.log(response.body.content);
    expect(response.body.content.length).toBe(6);
  });
  it('returns only id, username and email in content array for each user', async () => {
    await addUsers(11);
    const response = await getUsers();
    const user = response.body.content[0];
    expect(Object.keys(user)).toMatchObject(['id', 'username', 'email']);
  });
  it('returns 2 as totalPages when there are 15 active and 7 inactive users', async () => {
    await addUsers(15, 7);
    const response = await getUsers();
    expect(response.body.totalPages).toBe(2);
  });
  it('returns second page users and page indicator when page is set as 1 in request paramater', async () => {
    await addUsers(11);
    const response = await getUsers().query({ page: 1 });
    expect(response.body.content[0].username).toBe('user11');
    expect(response.body.page).toBe(1);
  });
  it('returns first page when page is set below zero as request parameter', async () => {
    await addUsers(11);
    const response = await getUsers().query({ page: -5 });
    expect(response.body.page).toBe(0);
  });
  it('returns 5 users and corresponding size indicator when size is set as 5 in request parameter', async () => {
    await addUsers(11);
    const response = await getUsers().query({ size: 5 });
    expect(response.body.content.length).toBe(5);
    expect(response.body.size).toBe(5);
  });
  it('returns 10 users and corresponding size indicator when size is set as 1000', async () => {
    await addUsers(11);
    const response = await getUsers().query({ size: 1000 });
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });
  it('returns 10 users and corresponding size indicator when size is set as 0', async () => {
    await addUsers(11);
    const response = await getUsers().query({ size: 0 });
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });
  it('returns page as zero and size as 10 when non numeric query params provided for both', async () => {
    await addUsers(11);
    const response = await getUsers().query({ size: 'size', page: 'page' });
    expect(response.body.size).toBe(10);
    expect(response.body.page).toBe(0);
  });
});
describe('Get User', () => {
  const getUser = (id = 5) => {
    return request(app).get('/api/1.0/users/' + id);
  };
  it('returns 404 when user not found', async () => {
    const response = await getUser();
    expect(response.status).toBe(404);
  });
  it.each`
    language | message
    ${'tr'}  | ${tr.user_not_found}
    ${'en'}  | ${en.user_not_found}
  `('returns $message for unknown user when language is set to $language', async ({ language, message }) => {
    const response = await request(app).get('/api/1.0/users/5').set('Accept-Language', language);
    // console.log('message: ', message);
    expect(response.body.message).toBe(message);
  });
  it('returns proper error body when user not found', async () => {
    const nowInMillis = new Date().getTime();
    const response = await request(app).get('/api/1.0/users/5');
    const error = response.body;
    expect(error.path).toBe('/api/1.0/users/5');
    expect(error.timestamp).toBeGreaterThan(nowInMillis);
    expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);
  });
  it('returns 200 when an active user exists', async () => {
    const user = await User.create({
      username: 'user1',
      email: 'user1@mail.com',
      inactive: false,
    });
    // console.log('user: ', user);
    const response = await getUser(user.id);
    // console.log('response: ', response);
    expect(response.status).toBe(200);
  });
  it('returns id, username and email in response body when an active user exists', async () => {
    const user = await User.create({
      username: 'user1',
      email: 'user1@mail.com',
      inactive: false,
    });
    // console.log('user: ', user);
    const response = await getUser(user.id);
    // console.log('response: ', response);
    expect(Object.keys(response.body)).toEqual(['id', 'username', 'email']);
  });
  it('returns 404 when the user is inactive', async () => {
    const user = await User.create({
      username: 'user1',
      email: 'user1@mail.com',
      inactive: true,
    });
    // console.log('user: ', user);
    const response = await getUser(user.id);
    // console.log('response: ', response);
    expect(response.status).toBe(404);
  });
});
