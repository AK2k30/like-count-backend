require('dotenv').config();

const express = require('express');
const fs = require('fs');
const simpleGit = require('simple-git');

const app = express();
const git = simpleGit();

// Replace these with your GitHub username, repository name, and token
const username = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const token = process.env.GITHUB_TOKEN;

app.get('/like', (req, res) => {
  fs.readFile('like.txt', 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(readErr);
      res.status(500).send('An error occurred');
      return;
    }

    const likeCount = Number(data);
    fs.writeFile('like.txt', `${likeCount + 1}`, (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        res.status(500).send('An error occurred');
        return;
      }

      git.add('like.txt')
        .commit('Incremented like count')
        .push(`https://${token}@github.com/${username}/${repo}.git`, 'master', (pushErr) => {
          if (pushErr) {
            console.error(pushErr);
            res.status(500).send('An error occurred');
            return;
          }

          res.send('Like count incremented');
        });
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
