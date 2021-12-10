const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function () {
  it('should return an object with valid email to pull', function () {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = testUsers["userRandomID"];
    assert.equal(typeof user, typeof expectedUserID)
  });
  it('should return false when given an invalid email', function () {
    const user = findUserByEmail('fake@example.com', testUsers)
    const expectedUserID = "userRandomID";
    assert.isFalse(user)
  });
});