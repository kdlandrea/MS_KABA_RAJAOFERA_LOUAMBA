const express = require('express')
const fs = require('fs'); //file system
//const { userInfo } = require('os');
const app = express()
const port = 3000

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var request = require("request");

app.use(express.static('static'));
app.use(express.urlencoded({extended:false}));

io.on('connection', function () {
  console.log(port + " Connected with IO...");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
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

//request to auth.js
app.get('/session',(req,res)=>{
  request("http://localhost:3001/session", function (error, response, body) {
        res.send(body);
    });
})

app.post('/register',(req,res) => {
  request("http://localhost:3001/register", function (error, response, body) {
    res.send(body);
    });
})

app.post('/login',(req,res) => {
  request("http://localhost:3001/login", function (error, response, body) {
    res.send(body);
    });
})

//request to score.js
// app.post('/score',(req,res) => {
//   request("http://localhost:3002/score", function (error, response, body) {
//     res.send(body);
//     });
// })

app.get('/score',(req,res)=>{
  request("http://localhost:3002/score", function (error, response, body) {
        res.send(body);
    });
})

app.post('/scoreUpdate',(req,res) => {
  request("http://localhost:3002/scoreUpdate", function (error, response, body) {
    res.send(body);
    });
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
  // serve('0.0.0.0', 3000);
  // serve('0.0.0.0', 3001);

// app.get('/port', (req,res) => {
//   res.send(os.hostname() + " port "+port)
// })

// app.listen(port, () => {
//   console.log(`MOTUS APP working on ${os.hostname()} on port ${port}`)
// });