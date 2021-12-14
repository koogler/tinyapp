const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// Helper function to return the links only owned by the logged in user.
const urlsForUser = (id, urlDatabase) => {
  const userLinks = {}
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userLinks[key] = urlDatabase[key]
    }
  }
  return userLinks
}
// Finds the user by looking up it's email in the current database. If no 
// email is found, it returns false
const findUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

// Authenticates the user by comparing the given email/pwd to the database
const auth = (email, password, database) => {
  const user = findUserByEmail(email, database)
  if (user && bcrypt.compareSync(password, user.password)) {
    return user
  } else {
    return false
  }
}

// Random six string generator for making userIDs/shortURLs
const randomSixString = function generateRandomString() {
  let code = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

module.exports = {
  urlsForUser,
  findUserByEmail,
  auth,
  randomSixString
};