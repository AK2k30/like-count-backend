require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME, FILE_PATH } = process.env;

app.post('/like', async (req, res) => {
  try {
    const fileResponse = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    const currentLikes = parseInt(Buffer.from(fileResponse.data.content, 'base64').toString(), 10);
    const updatedLikes = currentLikes + 1;

    await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      message: 'Update like count',
      content: Buffer.from(updatedLikes.toString()).toString('base64'),
      sha: fileResponse.data.sha,
    }, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    res.json({ success: true, updatedLikes });
  } catch (error) {
    console.error('Failed to update like count:', error.response ? error.response.data : error);
    res.status(500).json({ success: false, message: 'An error occurred.', details: error.response ? error.response.data : error });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
