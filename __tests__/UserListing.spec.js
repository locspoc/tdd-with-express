/**
 * User Listing Specifciations
 */

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(async () => {
  await sequelize.sync();

  jest.setTimeout(30000);
});

beforeEach(() => {
  return User.destroy({ truncate: true });
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
});
