const express = require('express')
const fs = require('fs'); //file system
const { userInfo } = require('os');
const app = express()
const port = 3000
const session = require('express-session')

app.use(express.static('static'));
app.use(express.urlencoded({extended:false}));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


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
  var authData = JSON.parse(fs.readFileSync("../data/auth_couples.json",'utf8'))
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
  var authData = JSON.parse(fs.readFileSync("../data/auth_couples.json",'utf8'))
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
      res.redirect("/index.html");
    }else{
      res.redirect('/login.html#incorectLogin')
      console.log('Sorry darling, invalid username or password :/');
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
  console.log("MES DATAS:" +data)
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
  var users = readJSON()
  
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


app.get('/score', (req, res) => {//r??cup??re le tableau de score
  console.log("loggedUser: "+loggedUser)  
  var datas = JSON.parse(fs.readFileSync("../data/data_score.json","utf8"))
  res.send({data:datas,username: loggedUser});
})

function updateUser(id,score,average,tentatives){
  var datas = JSON.parse(fs.readFileSync("../data/data_score.json","utf8"))
  console.log("DATA BEFORE UPDATE: av "+datas[id]["average"] + "score"+datas[id]["score"])
  console.log("taille tentative avant push: " + datas[id]['tentative'].length)
  datas[id]['tentative'].push(parseFloat(tentatives))
  console.log("taille tentative apr??s push: " + datas[id]['tentative'].length)

  if (parseFloat(datas[id]['average'])>0|| average>0){
    console.log("IF AVERAGE > 0 :")
    totalTentatives = 0
    for (var i=0;i<datas[id]['tentative'].length;i++){
      totalTentatives = totalTentatives + parseFloat(datas[id]['tentative'][i])
    }
    console.log("total Tentatives : " + totalTentatives)
    newScore = datas[id]['score'] + 1
    newAverage = parseFloat(totalTentatives/newScore)
    console.log("[newScore, newAverage] = "+ [newScore,newAverage])
    datas[id]['score'] = newScore
    datas[id]['average'] = newAverage

  } else {
    console.log("ELSE AV =0")
    datas[id]['score'] = parseFloat(score)
    datas[id]['average'] = parseFloat(average)
  }
  let donnees = JSON.stringify(datas)
  fs.writeFile('../data/data_score.json', donnees, function(erreur) {
    if (erreur) {
      console.log(erreur)}
  })
  console.log("DATA AFTER UPDATE: "+ datas[id])
}
  
app.post('/scoreUpdate', (req, res) => {//r??cup??re le tableau de score  
  console.log('scoreUpdate \n')
  console.log(req.body)
  console.log("\n id :"+req.body['id']+ " score : "+req.body['sc']+" average : "+req.body['av'] + " tentatives: "+ req.body['t'] )
  var index = req.body['id']
  var newScore = req.body['sc']
  var newAverage = req.body['av']
  var newTentatives = req.body['t']
  updateUser(id=index,score=newScore,average=newAverage,tentatives=newTentatives)
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