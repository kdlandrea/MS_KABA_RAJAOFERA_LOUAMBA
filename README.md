# MOTUS - Microservices 
Project made by Laurène KABA, Jonathan LOUAMBA and Ari RAJAOFERA.

---

## Description
This code consists in launching the game MOTUS where the goal of the game is to find the word of day in five tries maximum.

## How to run ?
```
 npm install
 node server.js
```
Enter this link to test the game : [Motus](http://localhost:3000)

---

## How it works ?

```mermaid
sequenceDiagram
    Client->>+Server: /
    Server->>+Client: index.html
    Client->>Server:/127word
    Server->>Client:Word_TO_GUESS
    Note left of Client: Guessing
    Client->>Client: Guessing and storing info to localstorage
    Client->>Server:score.html
    Server->>Client: score.html
    Client->>Client : load score from local storage
```
