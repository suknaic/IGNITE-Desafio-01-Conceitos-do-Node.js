const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const USERS = [];

function checksExistsUserAccount(request, response, next) {
 const {username} = request.headers;

 const user = USERS.find(user => user.username === username);

 if(!user) {
   return response.status(400).json({error: "user not found"});
 }

 request.user = user;

 return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlredyExists = USERS.some(user => user.username === username);

  if(userAlredyExists) {
    return response.status(400).json({error: 'User alredy exists'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

   USERS.push(newUser);

   return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
 const { user } = request;

 return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const task = {};

  Object.assign(task, {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  user.todos.push(task)

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { id } = request.params;
  const {title, deadline} = request.body;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  if(!!taskIndex) {
    return response.status(404).json({error: "Not Found"});
  }

  Object.assign(user.todos[taskIndex], {
    title,
    deadline: new Date(deadline)
  })

  return response.status(201).json(user.todos[taskIndex]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { id } = request.params;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  if(!!taskIndex) {
    return response.status(404).json({error: "Not Found"});
  }

  user.todos[taskIndex].done = true;

  return response.status(201).json(user.todos[taskIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  if(!!taskIndex) {
    return response.status(404).json({error: "Not Found"});
  };

  user.todos.splice(taskIndex, 1);
  return response.status(204).send();
});

module.exports = app;
