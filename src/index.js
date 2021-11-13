const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(usr => usr.username === username)

  if(!user){
    return response.status(404).json({error: "Usuário não existe"})
  }

  request.user = user
  return next()
}

function checkExistsTodosId (request, response, next){
    const {id} = request.params
    const {user} = request
    const {todos} = user
  
    const idExists = todos.find(tds => tds.id === id)
    
    if(!idExists){
      return response.status(404).json({error: "Id não encontrado"})
    }
  
    request.idExists = idExists
    return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const checkExistsUsername = users.some((usr) => usr.username === username)

  if(!checkExistsUsername){
   users.push({ 
      id: uuidv4(), 
      name, 
      username, 
      todos: []
    })

  const userCreated = users.find(usr => usr.username === username) 

  return response.status(201).json(userCreated)
  
  }
  
  return response.status(400).json({error: "Usuário existente"})

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
 
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  const todo = { 
    id: uuidv4(), 
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).send(todo)

});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodosId, (request, response) => {
  const { idExists} = request
  const { title, deadline } = request.body
  
  idExists.title = title
  idExists.deadline = deadline

  return response.status(201).send(idExists)

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodosId, (request, response) => {
  const {idExists} = request
    
  idExists.done = true
  return response.status(201).send(idExists)

});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodosId, (request, response) => {
  const {user, idExists} = request
  const {todos} = user
  
  const num = todos.indexOf(idExists)
  
  todos.splice(num, 1)
 
 return response.status(204).send()

});

module.exports = app;