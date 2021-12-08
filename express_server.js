const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const randomSixString = function generateRandomString() {
  let code = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = []

app.get("/", (req, res) => {
  res.redirect('/urls')
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: (urlDatabase[req.params.shortURL]) };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //extract from form with req.body
  const fullURL = req.body.longURL
  let newShort = randomSixString()
  //save it to database
  urlDatabase[newShort] = JSON.stringify(fullURL).replace(/['"]+/g, '')
  res.redirect(`/urls/${newShort}`);      //redirect to home page with db
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const newShort = req.params.shortURL
  delete urlDatabase[newShort]
  res.redirect('/urls')
})

app.post("/urls/:shortURL/update", (req, res) => {
  const newShort = req.params.shortURL
  const newLong = req.body.newURL
  urlDatabase[newShort] = newLong
  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
