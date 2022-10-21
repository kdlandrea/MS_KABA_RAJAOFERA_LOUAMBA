const express = require('express')
const fs = require('fs') //file system
const app = express()
const port = 3000

// const port = process.env.PORT || 3000 
// const os = require('os');
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
const mypassword = 'mypassword'

// a variable to save a session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.get('/session',(req,res)=>{
  res.send(JSON.stringify(req.session))
})

app.post('/user',(req,res) => {
  console.log(req.body)
  if(req.body.username == myusername && req.body.password == mypassword){
      let see=req.session;
      see.userid=req.body.username;
      console.log(req.session)
      //res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
      res.redirect("index.html")
  }
  else{
      res.send('Invalid username or password');
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
    //console.log(randnb);
    res.send(mot)
  })

  app.get('/new_word', (req, res) => {
    randnb = getRandomInt(20000000)%lines.length;
    const mot =lines[randnb]
    //console.log(randnb);
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


// app.post('/login.html', (req, res) => {//envoi le login
//   var map = new Map();
//   res.send(req.body)
// })

function readJSON(){
  let fichier = fs.readFileSync('../data/data_score.json')
  let data = JSON.parse(fichier)
  console.log(data)
  return data
}

function writeJSON(init){
  let donnees = JSON.stringify(init)
  fs.writeFile('../data/data_score.json', donnees, function(erreur) {
    if (erreur) {
      console.log(erreur)}
  })
}

function addUser(name) {
  console.log('DEBUT FONCTION ADD')
  var users = require('../data/data_score.json')  
  
  const new_row = {
    username: name,
    score:0,
    average:0,
    tentative : []
  }
  var myBoolean = false
  for (var i=0; i < users.length; i++){
    if (users[i]["username"] == name){
      myBoolean = true
    }
  }
  if (myBoolean == false){
    users.push(new_row)}
  json_users = JSON.stringify(users)
  fs.writeFile('../data/data_score.json',json_users,function(erreur){
      if(erreur){
      console.log(erreur)
      }
  })
}


function readUsers() {
  const users = require('../data/data_score.json')  
  return users
}

// function updateUser(nb_id){
//   const users = require('../data/data_score.json')  
//   users[nb_id][]
// }

// app.post('/score_update', function (req, res, next) {
//   console.log('/score_update')
//   console.log(req.body.username)
//   updateUser(req.body.username)
// })

var loggedUser = ""

app.post('/score', function (req, res, next) {
  console.log('/SCORE')
  console.log(req.body.username)
  // let data = JSON.parse(req.body)
  // console.log(data)
  // writeJSON(req.body)
  loggedUser= req.body.username
  addUser(req.body.username)
  res.redirect("index.html")
  //res.send(req.body);
})


app.get('/score', (req, res) => {//récupère le tableau de score
  console.log("loggedUser: "+loggedUser)  
  var datas = JSON.parse(fs.readFileSync("../data/data_score.json","utf8"))
  res.send({data:datas,username: loggedUser});
})

function updateUser(id,score,average,){
  var datas = JSON.parse(fs.readFileSync("../data/data_score.json","utf8"))
  console.log("DATA BEFORE UPDATE: "+datas[id])
  datas[id]['score'] = score
  datas[id]['average'] = average
  let donnees = JSON.stringify(datas)
  fs.writeFile('../data/data_score.json', donnees, function(erreur) {
    if (erreur) {
      console.log(erreur)}
  })
  console.log("DATA AFTER UPDATE: "+ datas[id])
}
  
app.post('/scoreUpdate', (req, res) => {//récupère le tableau de score  
  console.log('scoreUpdate \n')
  console.log(req.body)
  console.log("\n id :"+req.body['id']+ " score : "+req.body['sc']+" average : "+req.body['av'] )
  var index = req.body['id']
  var newScore = req.body['sc']
  var newAverage = req.body['av']
  updateUser(index,newScore,newAverage)
})


///////////////// Proxy TP
// var http = require('http'); 
// function serve(ip, port) {
//   http.createServer(function (req, res) { 
//     res.writeHead(200, {'Content-Type': 'text/plain'}); 
//     res.write(JSON.stringify(req.headers));   
//     res.end("\nThere's no place like "+ip+":"+port+"\n");         
//   }).listen(port, ip);         
//   console.log('Server running at http://'+ip+':'+port+'/'); 
// } 
//   // Create three servers for // the load balancer, listening on any // network on the following three ports 
//   serve('0.0.0.0', 3000);
//   serve('0.0.0.0', 3001);

// app.get('/port', (req,res) => {
//   res.send(os.hostname() + " port "+port)
// })

// app.listen(port, () => {
//   console.log(`MOTUS APP working on ${os.hostname()} on port ${port}`)
// });






