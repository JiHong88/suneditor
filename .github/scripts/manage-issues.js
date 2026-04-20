const OWNER = 'jihong88';
const REPO = 'suneditor';
const TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
	Authorization: `token ${TOKEN}`,
	Accept: 'application/vnd.github.v3+json',
	'User-Agent': 'suneditor-issue-manager'
};
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;

const STALE_LABEL = 'stale';

// Warning thresholds (no activity since)
const ISSUE_WARN_DAYS = 42; // 6 weeks
const PR_WARN_DAYS = 84; // 12 weeks

// Grace period after stale label
const ISSUE_GRACE_DAYS = 7; // 1 week
const PR_GRACE_DAYS = 14; // 2 weeks

function daysAgo(days) {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

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

async function addLabel(number, label) {
	const res = await fetch(`${API}/issues/${number}/labels`, {
		method: 'POST',
		headers: { ...HEADERS, 'Content-Type': 'application/json' },
		body: JSON.stringify({ labels: [label] })
	});
	if (!res.ok) throw new Error(`Label #${number}: ${res.status} ${await res.text()}`);
}

async function closeIssue(number) {
	const res = await fetch(`${API}/issues/${number}`, {
		method: 'PATCH',
		headers: { ...HEADERS, 'Content-Type': 'application/json' },
		body: JSON.stringify({ state: 'closed' })
	});
	if (!res.ok) throw new Error(`Close #${number}: ${res.status} ${await res.text()}`);
}

// Find when the stale label was added
async function getStaleEventDate(number) {
	const events = await fetchAll(`/issues/${number}/events`);
	const staleEvent = events
		.filter((e) => e.event === 'labeled' && e.label?.name === STALE_LABEL)
		.pop(); // most recent
	return staleEvent ? new Date(staleEvent.created_at) : null;
}

// Check if there's any comment from non-bot users after a given date
async function hasActivityAfter(number, date) {
	const comments = await fetchAll(`/issues/${number}/comments`);
	return comments.some((c) => {
		const isBot = c.user?.type === 'Bot' || c.performed_via_github_app;
		return !isBot && new Date(c.created_at) > date;
	});
}

const ISSUE_WARN_COMMENT =
	'This issue has been automatically marked as **stale** because it has not had any activity for 6 weeks.\n\n' +
	'It will be **closed in 1 week** if no further activity occurs.\n' +
	'If this issue is still relevant, please leave a comment or update it to keep it open.\n\n' +
	'If a new version has been released recently, please test your scenario with that version to see if the issue persists.\n\n' +
	'Your feedback helps improve the project.';

const PR_WARN_COMMENT =
	'This pull request has been automatically marked as **stale** because it has not had any activity for 12 weeks.\n\n' +
	'It will be **closed in 2 weeks** if no further activity occurs.\n' +
	'If this PR is still relevant, please leave a comment, rebase, or update it to keep it open.\n\n' +
	'Your feedback helps improve the project.';

const ISSUE_CLOSE_COMMENT =
	'Thank you for your interest in the project.\n' +
	'This issue has been automatically closed due to inactivity.\n' +
	'If this issue is still relevant, feel free to reopen it with additional context.';

const PR_CLOSE_COMMENT =
	'Thank you for your contribution to the project.\n' +
	'This pull request has been automatically closed due to inactivity.\n' +
	'If this PR is still relevant, please feel free to reopen it and update your changes.';

async function manageIssues() {
	const issues = await fetchAll('/issues?state=open');

	for (const item of issues) {
		const isPR = !!item.pull_request;
		const hasStale = item.labels.some((l) => l.name === STALE_LABEL);
		const lastUpdated = new Date(item.updated_at);
		const warnThreshold = daysAgo(isPR ? PR_WARN_DAYS : ISSUE_WARN_DAYS);
		const graceDays = isPR ? PR_GRACE_DAYS : ISSUE_GRACE_DAYS;
		const type = isPR ? 'PR' : 'Issue';

		if (hasStale) {
			// --- Phase 2: Already warned → check grace period ---
			const staleDate = await getStaleEventDate(item.number);
			if (!staleDate) continue;

			// If someone commented after the stale label, skip (label will be removed manually or by another workflow)
			const hasNewActivity = await hasActivityAfter(item.number, staleDate);
			if (hasNewActivity) {
				console.log(`${type} #${item.number} — has new activity after stale, skipping`);
				continue;
			}

			const graceDeadline = new Date(staleDate.getTime() + graceDays * 24 * 60 * 60 * 1000);
			if (new Date() < graceDeadline) {
				console.log(`${type} #${item.number} — still in grace period until ${graceDeadline.toISOString()}`);
				continue;
			}

			// Grace period expired → close
			console.log(`${type} #${item.number} — grace period expired, closing`);
			await addComment(item.number, isPR ? PR_CLOSE_COMMENT : ISSUE_CLOSE_COMMENT);
			await closeIssue(item.number);
		} else {
			// --- Phase 1: Not yet warned → check if stale ---
			if (lastUpdated >= warnThreshold) continue;

			console.log(`${type} #${item.number} — marking stale (last updated: ${item.updated_at})`);
			await addComment(item.number, isPR ? PR_WARN_COMMENT : ISSUE_WARN_COMMENT);
			await addLabel(item.number, STALE_LABEL);
		}
	}
}

manageIssues().catch((err) => {
	console.error(err);
	process.exit(1);
});
