### fix

- Clicking the code block hover language button while the editor had focus closed the hover UI without opening the select menu — the unprevented mousedown blurred the wysiwyg, and the blur handler closes every non-fixed controller mid-press (`plugins/command/codeBlock`)
