# Digita Humanities: Data Explorer

blablabla about what is this repo about

## Installation and run in local
* **Setup Virtuoso database: ask @ehrmama about how to do this**
* **Install dependencies**
  - Node.js and npm: [Download](https://nodejs.org/en/download/)
  - NPM global modules:
```
npm install -g gulp jshint jscs pm2
```
* **Clone this repo**
```
git clone https://github.com/MGrin/DHExplorer.git
```
* **Set sparql endpoint url and graph name**

Modify the `config/config.server.js`, lines 25 and 26.
The `http://localhost:8890/sparql` should point to your sparql endpoint, and `http://localhost:8080/garzoni-data` should be the name of the graph

* **Install application dependencies**
```
npm install
bower install
```

* **Run using gulp**
Gulp will automatically compile needed files and do a bit of magic
```
gulp
```

The applocation will run on [http://localhost:7890/](http://localhost:7890/)

## Technologies

#### Backend

* [Node.js](https://nodejs.org/): JS everywhere! =)
* [Virtuoso](https://github.com/openlink/virtuoso-opensource): SparQL database
* [Express.js](http://expressjs.com/): Web framework for node.js
* [Socket.io](http://socket.io/): Sockets are used to speak with the client
* [Jade](http://jade-lang.com/): Template engine
* [Gulp](http://gulpjs.com/): Streaming build system
* [Bower](http://bower.io/): Frontend libraries package manager

#### Frontend

* [JQuery](https://jquery.com/): used for some DOM manipulation. Probably, can be removed
* [Socket.io](http://socket.io/): sockets are used to fetch data from server
* [VivaGraph](https://github.com/anvaka/VivaGraphJS): wrapper around canvas and WebGL for Graph visualization
* [Semantic-ui](http://semantic-ui.com/): user interface framework
* [ReactJS](https://facebook.github.io/react/index.html): used to render dinamic content inside charts, tables, etc... Basically makes the visualization of queries results easy
* [ChartJS](http://www.chartjs.org/): used to plot charts
* [Jade](http://jade-lang.com/): Template engine
* [Stylus](https://learnboost.github.io/stylus/): Expressive, dynamic, robust CSS

## Infrastructure

**Will be changed.**

Now:

Virtuoso database is stored on the PC5 (EPFL internal machine), but this will be moved away from there.

Application runs on the PC5 ([128.178.21.39](http://128.178.21.39:7890)) and on PC1 ([dhlabpc1.epfl.ch](http://dhlabpc1.epfl.ch:7890)).

The domain name [dhexplorer.org](http://dhexplorer.org) points to [dhlabpc1.epfl.ch](http://dhlabpc1.epfl.ch:7890)

## Project structure

The structure was inspired by the MVC philosophy, but handmade.

#### Backend
```
DHExplorer/
  |-- app.js                 # application entry file
  |-- package.json           # npm packages config file
  |-- bower.json             # bower packagesconfig file
  |-- gulpfile.js            # gulp config file
  |-- ecosystem.js           # pm2 config file
  |-- {.bowerrc,.jscsrc,.jshintignore,.jshintrc} # Bower, JSHint and JSCS config files
  |
  |--app/
  |   |-- queries.js         # file containing all queries that are used in the application
  |   |-- routes.server.js   # routes for HTTP requests
  |   |-- socket.server.js   # routes for socket requests
  |   |-- views/             # .jade files are stored here (only one for the moment)
  |   |-- controllers/       # different controllers for different parts of the application (Graph, search, statistics, etc.). All server business logic is here
  |
  |--config/
  |   |-- config.server.js   # application related config
  |   |-- express.js         # express.js config
  |   |-- logger.server.js   # server logger setup
  |
  |--public/                 # frontend files
  -
```

#### Frontend
```
public/
  |-- app.js              # entry frontend script
  |
  |--img/                 # images are here
  |--lib/                 # external libraries are here
  |--stylus/              # .styl files are here (the styles)
  |--js/
  |   |--models/          # JavaScript models that are used on the client. Only data models
  |   |--services/        # Singelton services that are used everywhere in the app. Ex.: Socket.service.js is responsable to send messages over the socket
  |   |--viewModels/      # ViewModels, are responsible for showing complex things. Only DOM manipulation.
  |   |--controllers/     # Business logic for different parts of application. Only business logic
  |   |--ReactComponents/ # ReactJS .jsx files
  |   |--WebGLComponents/ # VivaGraph models and WebGL Shaders for the graph visualization
  -
```
The `cdn` and `css` folders are generated by gulp and contain compiled and modified files, depending on the environment (development, testing or production). Do not modify files inside, they will be rewritten on the next application launch
## Deployment

Deployment is done using [PM2](https://github.com/Unitech/pm2).

The `ecosystem.js` file contains configurations for the deployment such as servers to deploy, the repository url and commands to execute before/after deploy.

Read more on the wiki page

## Guidelines

The code structure is described on the wiki page with examples.

The styling guide is also described on the wiki page.

Please, use [JSHint](http://jshint.com/) and [JSCS](http://jscs.info/) plugins to check if you follow the code style guide. All styling rules are described in `.jshintrc`, `.jshintignore` and `.jscsrc` files.
