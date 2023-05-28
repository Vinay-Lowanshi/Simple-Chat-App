// server.js
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const MESSAGES_FILE = 'messages.txt';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/login', (req, res) => {
  res.send(`
    <form action="/login" method="post">
      <input type="text" name="username" placeholder="Enter your username" required>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/');
});

app.get('/', (req, res) => {
  const username = req.cookies.username;

  // Check if the messages file exists
  fs.access(MESSAGES_FILE, fs.constants.F_OK, (err) => {
    if (err) {
      // Create the messages file if it doesn't exist
      fs.writeFile(MESSAGES_FILE, '', (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    // Read the existing messages
    fs.readFile(MESSAGES_FILE, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.send('Error reading messages');
      }

      const messages = data
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));

      const formattedMessages = messages
        .map(({ username, message }) => {
          if (username === req.cookies.username) {
            return `<strong>${username}: </strong>${message}`;
          } else {
            return `${username}: ${message}`;
          }
        })
        .join('<br>');

      res.send(`
        <form action="/message" method="post">
          <input type="text" name="message" placeholder="Enter your message" required>
          <button type="submit">Send</button>
        </form>
        <div>${formattedMessages}</div>
      `);
    });
  });
});

app.post('/message', (req, res) => {
  const { message } = req.body;
  const username = req.cookies.username;

  // Store the message in the file
  const newMessage = { username, message };
  const line = JSON.stringify(newMessage);

  fs.appendFile(MESSAGES_FILE, line + '\n', (err) => {
    if (err) {
      console.error(err);
    }
  });

  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
