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

const getCurrentUser = (req, res, next) => {
  const currentUser = users[req.session['user_id']];
  req.currentUser = currentUser;
  next();
};

app.use(getCurrentUser);

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

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPWD = req.body.psw;
  const hashedPWD = bcrypt.hashSync(newPWD, salt);
  const user = findUserByEmail(newEmail, users);
  if (!user) {
    const cookieID = addNewUser(newEmail, hashedPWD, users);
    req.session['user_id'] = cookieID;
    res.redirect('/login');
  } else {
    res.status(400);
    res.send('Account already exists!');
  }
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

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

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { users, currentUser: req.currentUser, shortURL: req.params.shortURL, longURL: (urlDatabase[req.params.shortURL]['longURL']) };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const fullURL = req.body.longURL;
  let newShort = randomSixString();
  urlDatabase[newShort] = { longURL: JSON.stringify(fullURL).replace(/['"]+/g, ''), userID: req.session['user_id'] };
  res.redirect(`/urls/${newShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  let shortie = req.params.shortURL;
  console.log(shortie);
  console.log(urlDatabase[shortie]);
  const redirectLongURL = urlDatabase[shortie].longURL;
  res.redirect(redirectLongURL);
  console.log(urlDatabase);
});

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

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
