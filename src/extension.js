// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const fetchAndStore = require('./fetch').fetchAndStore
const { extractTitleSlug, fetchAndStore } = require('./fetch')

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cph-leetcode-ash" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const fetch_disposable = vscode.commands.registerCommand('cph-leetcode-ash.fetch', function () {
		// The code you place here will be executed every time your command is executed
		const url = "https://leetcode.com/problems/reverse-integer/description/";
		let casePath = `D:\\Ashnidh\\Program Tests\\cph_project\\vsc_extension\\cph_leetcode_ash\\cph-leetcode-ash\\`;
		const titleSlug = extractTitleSlug(url);
		fetchAndStore(url, casePath)
		// fetchAndStore(url);
		// Display a message box to the user
		vscode.window.showInformationMessage(`Fetching ${titleSlug}!`);
	});
	const run_disposable = vscode.commands.registerCommand('cph-leetcode-ash.run', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Running!');
	});

	context.subscriptions.push(fetch_disposable);
	context.subscriptions.push(run_disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
