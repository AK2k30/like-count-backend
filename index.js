require('dotenv').config(); // Ensure this is near the top of your file

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Use environment variables
const githubToken = process.env.GITHUB_TOKEN;
const repoOwner = process.env.REPO_OWNER;
const repoName = process.env.REPO_NAME;
const filePath = process.env.FILE_PATH;

app.use(bodyParser.json());

app.post('/like', async (req, res) => {
  try {
    // Fetch the current content of the file
    const fileResponse = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { Authorization: `token ${githubToken}` },
    });

    const currentLikes = parseInt(Buffer.from(fileResponse.data.content, 'base64').toString(), 10);
    const updatedLikes = currentLikes + 1;

    // Update the file with the new like count
    await axios.put(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      message: 'Update like count',
      content: Buffer.from(updatedLikes.toString()).toString('base64'),
      sha: fileResponse.data.sha,
    }, {
      headers: { Authorization: `token ${githubToken}` },
    });

    res.json({ success: true, updatedLikes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the like count.' });
  }
});

module.exports = app;
