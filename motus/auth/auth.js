const express = require('express')
const app = express()
const fs = require('fs');
const port = 3001;
const session = require('express-session')

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var request = require("request");

app.use(express.static('../static'));
app.use(express.urlencoded({extended:false}));

io.on('connection', function () {
  console.log(port + " Connected with IO...");
});

server.listen(port, function () {
  console.log(port + " listening...");
});

// a variable to save a session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.get('/session',(req,res)=>{
  res.send(JSON.stringify(req.session))
})

app.post('/register',(req,res) => {
  console.log(req.body)
  if(req.body.username && req.body.password){
  console.log("enregistrement de l'utilisateur "+req.body.username+ " en BDD en cours.")
  const newUsername = req.body.username
  const newPassword = req.body.password

  // Checking if username already used
  var authData = JSON.parse(fs.readFileSync("../../data/auth_couples.json",'utf8'))
  for (var i=0;i<authData["auth"].users.length;i++){
    console.log("value: "+ authData["auth"].users[i]);
    if (authData["auth"].users[i]==req.body.username){
      res.send("Username already used, go back on the previous page and use another username. =)")
      return
    }}

  //Adding new infos to JSON file
  console.log('Adding new infos to database: \n')
  authData["auth"].users.push(newUsername)
  authData["auth"].passwords.push(newPassword)
  fs.writeFileSync('../../data/auth_couples.json', JSON.stringify(authData))
  res.redirect("login.html")
  
  }
  else{
  res.redirect("register.html")}
})


app.post('/login',(req,res) => {
  console.log(req.body)
  var authData = JSON.parse(fs.readFileSync("../../data/auth_couples.json",'utf8'))
  isLoginOK = false;
  for (var i=0;i<authData["auth"].users.length;i++){
    if(req.body.username == authData["auth"].users[i] && req.body.password == authData["auth"].passwords[i]){
        let see=req.session;
        see.userid=req.body.username;
        console.log(req.session);
        isLoginOK = true;
      }     
    }
    if(isLoginOK){
      res.redirect("http://localhost:3000/index.html");
    }else{
      res.redirect('/login.html#incorectLogin')
      console.log('Sorry darling, invalid username or password :/');
    }

})

//request for score
app.post('/score',(req,res) => {
  request("http://localhost:3002/score", function (error, response, body) {
    res.send(body);
    });
})
