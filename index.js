require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Configure CORS to only accept requests from your frontend domain
app.use(cors({
  origin: 'https://giveway.mygiveway.tech',
  optionsSuccessStatus: 200, // For legacy browser support
}));

app.use(express.json()); // For parsing application/json

const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME, FILE_PATH } = process.env;

app.post('/like', async (req, res) => {
  try {
    const fileResponse = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    const decodedContent = Buffer.from(fileResponse.data.content, 'base64').toString();
    const currentLikes = parseInt(decodedContent, 10);

    if (Number.isNaN(currentLikes)) {
      console.error('Current like count is not a number:', decodedContent);
      return res.status(400).json({ success: false, message: 'Current like count is not a number', details: decodedContent });
    }

    const updatedLikes = currentLikes + 1;
    const updatedContent = Buffer.from(updatedLikes.toString()).toString('base64');

    await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      message: 'Update like count',
      content: updatedContent,
      sha: fileResponse.data.sha,
    }, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    res.json({ success: true, updatedLikes });
  } catch (error) {
    console.error('Failed to update like count:', error);
    res.status(500).json({ success: false, message: 'An error occurred.', details: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
