const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const OWNER = 'jihong88';
const REPO = 'suneditor';

// Read release-note.md and strip the leading "## <version>" heading (and blank lines that follow).
// The file only holds the current version's section, so the remainder is the release body.
function readReleaseBody(versionName) {
	const notePath = path.join(__dirname, '..', '..', 'release-note.md');
	if (!fs.existsSync(notePath)) {
		console.log('release-note.md not found, skipping release body');
		return '';
	}

	const lines = fs.readFileSync(notePath, 'utf8').split(/\r?\n/);

	// Drop the first "## x.y.z" heading if present.
	if (lines.length && /^##\s+/.test(lines[0])) {
		lines.shift();
	}
	// Drop leading blank lines.
	while (lines.length && lines[0].trim() === '') {
		lines.shift();
	}

	return lines.join('\n').trim();
}

async function closeMilestoneAndIssues(versionName) {
	const milestones = await octokit.rest.issues.listMilestones({
		owner: OWNER,
		repo: REPO,
		state: 'open',
	});

	const milestone = milestones.data.find((m) => m.title === versionName);
	if (!milestone) {
		console.log('No matching milestone found');
		return;
	}

	const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
		owner: OWNER,
		repo: REPO,
		state: 'open',
		milestone: milestone.number,
	});

	for (const issue of issues) {
		await octokit.rest.issues.createComment({
			owner: OWNER,
			repo: REPO,
			issue_number: issue.number,
			body:
				'Thank you for your engagement with the project.\n' +
				'This issue has been resolved for version ' +
				versionName +
				'.\n' +
				'If the problem persists or if you believe this issue is still relevant,\n' +
				'please open a new issue referencing this one.',
		});

		await octokit.rest.issues.update({
			owner: OWNER,
			repo: REPO,
			issue_number: issue.number,
			state: 'closed',
		});
	}

	// Close the milestone itself once all its issues are closed.
	await octokit.rest.issues.updateMilestone({
		owner: OWNER,
		repo: REPO,
		milestone_number: milestone.number,
		state: 'closed',
	});
	console.log(`Milestone "${versionName}" closed (${issues.length} issue(s)).`);
}

async function createRelease(versionName) {
	const body = readReleaseBody(versionName);

	await octokit.rest.repos.createRelease({
		owner: OWNER,
		repo: REPO,
		tag_name: versionName, // e.g. "3.2.4"
		target_commitish: process.env.GITHUB_SHA,
		name: `v${versionName}`, // e.g. "v3.2.4"
		body,
	});
	console.log(`Release "v${versionName}" created (tag ${versionName}).`);
}

async function run() {
	const versionName = process.env.VERSION_NAME;
	if (!versionName) {
		console.log('No version name provided');
		return;
	}

	try {
		await closeMilestoneAndIssues(versionName);
	} catch (error) {
		console.error(`Error while processing milestone/issues: ${error}`);
	}

	try {
		await createRelease(versionName);
	} catch (error) {
		console.error(`Error while creating release: ${error}`);
		process.exit(1);
	}
}

run();
