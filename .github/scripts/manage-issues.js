const OWNER = 'jihong88';
const REPO = 'suneditor';
const TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
	Authorization: `token ${TOKEN}`,
	Accept: 'application/vnd.github.v3+json',
	'User-Agent': 'suneditor-issue-manager'
};
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const SIX_WEEKS_AGO = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000);
const TWELVE_WEEKS_AGO = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);

async function fetchAll(path) {
	const items = [];
	let page = 1;
	while (true) {
		const res = await fetch(`${API}${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`, { headers: HEADERS });
		if (!res.ok) throw new Error(`GET ${path} page=${page}: ${res.status} ${await res.text()}`);
		const data = await res.json();
		if (data.length === 0) break;
		items.push(...data);
		page++;
	}
	return items;
}

async function addComment(number, body) {
	const res = await fetch(`${API}/issues/${number}/comments`, {
		method: 'POST',
		headers: { ...HEADERS, 'Content-Type': 'application/json' },
		body: JSON.stringify({ body })
	});
	if (!res.ok) throw new Error(`Comment #${number}: ${res.status} ${await res.text()}`);
}

async function closeIssue(number) {
	const res = await fetch(`${API}/issues/${number}`, {
		method: 'PATCH',
		headers: { ...HEADERS, 'Content-Type': 'application/json' },
		body: JSON.stringify({ state: 'closed' })
	});
	if (!res.ok) throw new Error(`Close #${number}: ${res.status} ${await res.text()}`);
}

const ISSUE_COMMENT =
	'Thank you for your engagement with the project.\n' +
	'Due to a lack of activity for over 6 weeks, this issue has been automatically closed.\n' +
	'This is part of the process to keep the project up-to-date.\n\n' +
	'If a new version has been released recently, please test your scenario with that version to see if the issue persists.\n' +
	'If the problem still exists or if you believe this issue is still relevant, \n' +
	'feel free to reopen it and provide additional comments.\n\n' +
	'I truly appreciate your continuous interest and support for the project. Your feedback is crucial in improving its quality.';

const PR_COMMENT =
	'Thank you for your contribution to the project.\n' +
	'This pull request has had no activity for over 12 weeks.\n\n' +
	'If a new version has been released recently, please rebase and verify your changes still apply.\n' +
	'If you believe this PR is still relevant, please leave a comment to let us know.\n\n' +
	'I truly appreciate your continuous interest and support for the project.';

async function manageIssues() {
	const issues = await fetchAll('/issues?state=open');

	for (const item of issues) {
		const lastUpdated = new Date(item.updated_at);
		const threshold = item.pull_request ? TWELVE_WEEKS_AGO : SIX_WEEKS_AGO;
		if (lastUpdated >= threshold) continue;

		if (item.pull_request) {
			// PR: comment only
			console.log(`PR #${item.number} — commenting (last updated: ${item.updated_at})`);
			await addComment(item.number, PR_COMMENT);
		} else {
			// Issue: comment + close
			console.log(`Issue #${item.number} — commenting & closing (last updated: ${item.updated_at})`);
			await addComment(item.number, ISSUE_COMMENT);
			await closeIssue(item.number);
		}
	}
}

manageIssues().catch((err) => {
	console.error(err);
	process.exit(1);
});
