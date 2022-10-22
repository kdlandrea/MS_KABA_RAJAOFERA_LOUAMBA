const express = require('express')
const app = express()
const fs = require('fs');
const port = 3002;

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static('../static'));
app.use(express.urlencoded({extended:false}));

io.on('connection', function () {
  console.log(port + " Connected with IO...");
});

server.listen(port, function () {
  console.log(port + " listening...");
});


function readJSON(){
    let fichier = fs.readFileSync('../../data/data_score.json')
    let data = JSON.parse(fichier)
    console.log("MES DATAS:" +data)
    return data
  }
  
  function addUser(name) {
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
    fs.writeFile('../../data/data_score.json',json_users,function(erreur){
        if(erreur){
        console.log(erreur)
        }
    })
  }
  
  var loggedUser = ""
  
  app.post('/score', function (req, res, next) {
    console.log('/SCORE')
    console.log(req.body.username)
    loggedUser= req.body.username
    addUser(req.body.username)
    res.redirect("http://localhost:3000/index.html")
    //res.send(req.body);
  })
  
  
  app.get('/score', (req, res) => {//récupère le tableau de score
    console.log("loggedUser: "+loggedUser)  
    var datas = JSON.parse(fs.readFileSync("../../data/data_score.json","utf8"))
    res.send({data:datas,username: loggedUser});
  })
  
  function updateUser(id,score,average,tentatives){
    var datas = JSON.parse(fs.readFileSync("../../data/data_score.json","utf8"))
    console.log("DATA BEFORE UPDATE: av "+datas[id]["average"] + "score"+datas[id]["score"])
    console.log("taille tentative avant push: " + datas[id]['tentative'].length)
    datas[id]['tentative'].push(parseFloat(tentatives))
    console.log("taille tentative après push: " + datas[id]['tentative'].length)
  
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
    fs.writeFile('../../data/data_score.json', donnees, function(erreur) {
      if (erreur) {
        console.log(erreur)}
    })
    console.log("DATA AFTER UPDATE: "+ datas[id])
  }
    
  app.post('/scoreUpdate', (req, res) => {//récupère le tableau de score  
    console.log('scoreUpdate \n')
    console.log(req.body)
    console.log("\n id :"+req.body['id']+ " score : "+req.body['sc']+" average : "+req.body['av'] + " tentatives: "+ req.body['t'] )
    var index = req.body['id']
    var newScore = req.body['sc']
    var newAverage = req.body['av']
    var newTentatives = req.body['t']
    updateUser(id=index,score=newScore,average=newAverage,tentatives=newTentatives)
  })