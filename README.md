#
<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&duration=8000&pause=871&color=F70000&width=435&lines=This+Repo+Is+In+Underconstruction" alt="Typing SVG" /></a>

#

## Installation & Running

### Installation

First clone this repository to your local machine.

There are two parts in the repository, which you might need to run.

#### Server

To use the server, navigate to the `server` directory, install the dependencies using:

```bash
$ cd server
$ npm install
```

#### Client

To use the client, navigate to the `client` directory, install the dependencies using:

```bash
$ cd client
$ npm install
```

### Running the Application

You have to run two processes, each for the server and the client. Make sure you have two terminal processes running for the same.

#### Server

```bash
$ cd server
$ npm start
```

#### Client

```bash
$ cd client
$ npm start
```

If you need HTTPS in development, use:

```bash
$ cd client
$ HTTPS=true npm start
```

If you would like to run in production mode for the client, use:

```bash
$ cd client
$ PORT=80 npm run start:production
```

If you need HTTPS, use:

```bash
$ cd client
$ HTTPS=true PORT=443 npm run start:production
```

