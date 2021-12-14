const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { application } = require("express");
const { prototype } = require("body-parser");
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['sdf8g789sdf7g98sdf7g89sdfg79sd8fg7', '89sdf7g089sdjF089SDFJ0sdf']
}));
const salt = bcrypt.genSaltSync(10);

const { urlsForUser, findUserByEmail, auth, randomSixString } = require("./helpers");

const urlDatabase = {
};

const users = {
};

//Finds the currently logged in user
const getCurrentUser = (req, res, next) => {
  const currentUser = users[req.session['user_id']];
  req.currentUser = currentUser;
  next();
};

app.use(getCurrentUser);

// Cleaner way to add a new user to the database, with built in hashing of password.
const addNewUser = (email, password, database) => {
  const newID = randomSixString();
  const newUser = {
    id: newID,
    email,
    password: bcrypt.hashSync(password, salt)
  };
  database[newID] = newUser;
  return newUser;
};

app.get("/register", (req, res) => {
  res.render("urls_register");
});

// Adds new user to the database, and logs in the user with the provided credentials
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPWD = req.body.psw;
  const hashedPWD = bcrypt.hashSync(newPWD, salt);
  const user = findUserByEmail(newEmail, users);
  if (!user) {
    const cookieID = addNewUser(newEmail, hashedPWD, users);
    req.session['user_id'] = cookieID.id;
    res.redirect('/urls');
  } else {
    res.status(400);
    res.send('Account already exists!');
  }
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

// Home page, displays URLs, as well as shortcut to Edit, and button to delete
app.get("/urls", (req, res) => {
  const isUser = (req.session['user_id']);
  const templateVars = {
    users, urls: urlsForUser(isUser, urlDatabase), currentUser: req.currentUser
  };
  if (!isUser) {
    res.render("urls_nonuser", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

// Page for building new URLS
app.get("/urls/new", (req, res) => {
  const isUser = (req.session['user_id']);
  const templateVars = {
    users, currentUser: req.currentUser
  };
  if (!isUser) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

// Page for viewing and editing the shortened URLs. Displays their six string code and what URL they are shortening.
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { users, currentUser: req.currentUser, shortURL: req.params.shortURL, longURL: (urlDatabase[req.params.shortURL]['longURL']) };
  if (req.session['user_id'] === urlDatabase[shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(401);
    res.send("Hey, you're not supposed to be in here!");

  }
});

app.post("/urls", (req, res) => {
  if (req.session['user_id']) {
    const fullURL = req.body.longURL;
    let newShort = randomSixString();
    urlDatabase[newShort] = { longURL: JSON.stringify(fullURL).replace(/['"]+/g, ''), userID: req.session['user_id'] };
    res.redirect(`/urls/${newShort}`);
  } else {
    res.status(401)
    res.send("Hey, log in first buddy!")
  }
});

// Redirects the user to the shortened URL's long form
app.get("/u/:shortURL", (req, res) => {
  let shortie = req.params.shortURL;
  const redirectLongURL = urlDatabase[shortie].longURL;
  res.redirect(redirectLongURL);
});

// Allows user to delete shortened URLs by the press of a button
app.post("/urls/:shortURL/delete", (req, res) => {
  const isUser = (req.session['user_id']);
  const usersURLs = urlsForUser(isUser, urlDatabase);
  if (Object.keys(usersURLs).includes(req.params.shortURL)) {
    const newShort = req.params.shortURL;
    delete urlDatabase[newShort];
    res.redirect('/urls');
  } else {
    res.status(401);
    res.send("Hey, you're not supposed to be in here!");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const isUser = (req.session['user_id']);
  const usersURLs = urlsForUser(isUser, urlDatabase);
  if (Object.keys(usersURLs).includes(req.params.shortURL)) {
    const short = req.params.shortURL;
    const newLong = req.body.newURL;
    urlDatabase[short]['longURL'] = newLong;
    res.redirect('/urls');
    res.redirect('/urls');
  } else {
    res.status(401);
    res.send("Hey, you're not supposed to be in here!");
  }
});

app.post("/login", (req, res) => {
  let newEmail = req.body.email;
  let newPWD = req.body.psw;
  let hashedPWD = bcrypt.hashSync(newPWD, salt);
  const user = auth(newEmail, hashedPWD, users);
  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    res.status(401);
    res.send("Uh oh, either email or password is wrong!");
  }
});

// Functional login page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

// Removes all cookies and redirects back to home page
app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

// Opens port on whatever number you have set to the const PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
