const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function closeIssuesForMilestone() {
  const owner = "jihong88";
  const repo = "suneditor";
  const versionName = process.env.VERSION_NAME;

  if (!versionName) {
    console.log("No version name provided");
    return;
  }

  try {
    const milestones = await octokit.rest.issues.listMilestones({
      owner,
      repo,
      state: "open",
    });

    const milestone = milestones.data.find((m) => m.title === versionName);
    if (!milestone) {
      console.log("No matching milestone found");
      return;
    }

    const issues = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
      milestone: milestone.number,
    });

    issues.data.forEach(async (issue) => {
      const comment = {
        owner,
        repo,
        issue_number: issue.number,
        body:
          "Thank you for your engagement with the project.\n" +
          "This issue has been resolved for version " +
          versionName +
          ".\n" +
          "If the problem persists or if you believe this issue is still relevant,\n" +
          "please reopen it with additional comments.",
      };
      await octokit.issues.createComment(comment);

      await octokit.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        state: "closed",
      });
    });
  } catch (error) {
    console.error(`Error while processing issues for milestone: ${error}`);
  }
}

closeIssuesForMilestone();
