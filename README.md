# Node Server

This server will be of use in independent projects, such as using the server to help build out small scale angular, react, and vue projects to showcase front end work  

## Dependencies

First, clone the project from github. In order to get the server up and running, you will need to install the dependencies; `npm i -g`. Once the dependencies are installed. You can open the project up inside the directory with the `server.js` file, open up a terminal, and if you installed nodemon, type `nodemon server.js`, if not, type `node server.js`

### Node

`https://nodejs.org/en/`

### Express

`npm i -g express`

### Nodemon - optional

`npm i -g nodemon`

### Endpoints Available

`GET`       /  
`GET`       /api/users  
`GET`       /api/users/:id  
`POST`      /api/users      - requires a raw JSON object  
`PUT`       /api/users/:id  - requires a raw JSON object  
`DELETE`    /api/users/:id  
