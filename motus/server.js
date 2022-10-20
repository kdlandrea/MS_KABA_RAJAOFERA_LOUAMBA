const express = require('express')
const fs = require('fs'); //file system
const { userInfo } = require('os');
const app = express()
const port = 3000
const session = require('express-session')

app.use(express.static('static'));
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//username and password
const myusername = 'user1'
const mypassword = 'mypassword1'

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
  console.log("name : " + newUsername + " pwd :" + newPassword)
  console.log("Checking if username already used")
  // Checking if username already used
  var authData = JSON.parse(fs.readFileSync("../data/auth_couples.json",'utf8'))
  console.log("FOR LOOP \n")
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
  fs.writeFileSync('../data/auth_couples.json', JSON.stringify(authData))
  res.redirect("login.html")
  
  }
  else{
  res.redirect("register.html")}
})


app.post('/login',(req,res) => {
  console.log(req.body)
  if(req.body.username == myusername && req.body.password == mypassword){
      let see=req.session;
      see.userid=req.body.username;
      console.log(req.session)
      //res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
      res.redirect("index.html")
  }
  else{
      res.send('Sorry darling, invalid username or password :/');
      res.redirect("login.html");
  }
})

function randNv(){
  var oneDayInMs = 1000*60*60*24;
  var currentTimeInMs = new Date().getTime();  // UTC time
  var timeInDays = Math.floor(currentTimeInMs / oneDayInMs);
  var numberForToday = timeInDays % 9999;
  //console.log(numberForToday);
  // zero-filling of numbers less than four digits might be optional for you
  // zero-filled value will be a string to maintain its leading 0s
  var fourDigitNumber = numberForToday.toString();
  while(fourDigitNumber.length < 4)
  {
    fourDigitNumber = 0+fourDigitNumber;// add zeros
  }
  //console.log(fourDigitNumber);
  return fourDigitNumber;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

fs.readFile(__dirname+'/../data/liste_francais_utf8.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  //console.log(data);
  const lines = data.split('\n')
  app.get('/127word', (req, res) => {
    randnb = randNv();
    const mot =lines[randnb]
    console.log(randnb);
    res.send(mot)
  })

  app.get('/new_word', (req, res) => {
    randnb = getRandomInt(20000000)%lines.length;
    const mot =lines[randnb]
    console.log(randnb);
    res.send(mot)
  })
})




app.post('/index.html', function (req, res, next) {
  const mot_test = req.body;
  res.send(mot_test);
})

app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})