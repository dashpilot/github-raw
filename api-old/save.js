import { Octokit } from "@octokit/rest";

export default async (req, res) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // Make sure to set this in your Vercel environment variables
  });

  const { content } = req.body;

  const owner = "Dashpilot";
  const repo = "github-raw";
  const path = "data.json";
  const message = "updating from CMS";

  try {
    let sha;

    // Try to get the file to get its SHA
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      sha = data.sha;
    } catch (error) {
      // If the file doesn't exist, it's okay and we can continue without a SHA
      if (error.status !== 404) {
        throw error;
      }
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      sha, // Pass the SHA here
      committer: {
        name: process.env.NAME,
        email: process.env.EMAIL,
      },
      author: {
        name: process.env.NAME,
        email: process.env.EMAIL,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
