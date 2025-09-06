import * as vscode from "vscode";

// @TODO(doing)[low]: mover para arquivo separado de types/interfaces
interface TodoHit {
	file: string;
	line: number;
	text: string;
}

interface CacheEntry {
	mtime: number;
	hits: { line: number; text: string }[];
}

interface CacheData {
	version: 1;
	files: Record<string, CacheEntry>;
}

interface ScanResult {
	hits: TodoHit[];
	reused: number;
	scanned: number;
}

let output: vscode.OutputChannel | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "todo-board" is now active!');

	const scanCmd = vscode.commands.registerCommand(
		"todo-board.scanTodos",
		async () => {
			output ??= vscode.window.createOutputChannel("TODO Board");
			output.clear();
			output.appendLine("== Scan @TODO iniciado ==");

			const started = Date.now();

			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "Escaneando @TODO...",
					cancellable: true,
				},
				async (progress, token) => {
					try {
						const { hits, reused, scanned } = await scanWorkspace(
							progress,
							token,
						);

						if (!output) {
							return;
						}

						if (token.isCancellationRequested) {
							output.appendLine("Operação cancelada.");
							return;
						}

						await persistResults(hits);

						if (hits.length === 0) {
							output.appendLine("Nenhum @TODO encontrado.");
						} else {
							for (const r of hits) {
								output.appendLine(`${r.file}:${r.line + 1}: ${r.text}`);
							}

							output.appendLine(`-- Total: ${hits.length}`);
							output.appendLine("Arquivo salvo: .todo-board/todos.json");
							output.appendLine(
								`Cache: reutilizados ${reused}, reprocessados ${scanned}`,
							);
						}
					} catch (err) {
						if (output) {
							const message = err instanceof Error ? err.message : String(err);
							output.appendLine(`Erro: ${message}`);
						}
					}
				},
			);

			const elapsedSec = ((Date.now() - started) / 1000).toFixed(2);
			output.appendLine(`== Fim (${elapsedSec}s) ==`);
			output.show(true);
		},
	);

	context.subscriptions.push(scanCmd);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
	// Nenhuma limpeza necessária no momento.
}

async function readCache(root: vscode.Uri): Promise<CacheData> {
	const cacheFile = vscode.Uri.joinPath(root, ".todo-board", "cache.json");

	try {
		const data = await vscode.workspace.fs.readFile(cacheFile);
		const parsed = JSON.parse(new TextDecoder().decode(data));
		if (parsed && parsed.version === 1 && parsed.files) {
			return parsed as CacheData;
		}
	} catch {
		// ignore
	}

	return { version: 1, files: {} };
}

async function writeCache(root: vscode.Uri, cache: CacheData): Promise<void> {
	const dir = vscode.Uri.joinPath(root, ".todo-board");
	await vscode.workspace.fs.createDirectory(dir);
	const cacheFile = vscode.Uri.joinPath(dir, "cache.json");

	await vscode.workspace.fs.writeFile(
		cacheFile,
		new TextEncoder().encode(JSON.stringify(cache, null, 2)),
	);
}

async function scanWorkspace(
	progress?: vscode.Progress<{ message?: string; increment?: number }>,
	token?: vscode.CancellationToken,
): Promise<ScanResult> {
	const hits: TodoHit[] = [];
	let reused = 0;
	let scanned = 0;

	// checado por linha
	const pattern = /@TODO(?:\([^)]*\))?/;

	// Construir include com extensões configuradas
	const exts = vscode.workspace
		.getConfiguration("todo-board")
		.get<string[]>("fileExtensions", [
			"ts",
			"tsx",
			"js",
			"jsx",
			"mjs",
			"cjs",
			"md",
			"json",
		]);

	const include = `**/*.{${exts.join(",")}}`;

	// @TODO: mover para arquivo de constantes para melhor organização
	const exclude =
		"{**/node_modules/**,**/assets/**,**/.git/**,**/.svn/**,**/.hg/**,**/.DS_Store,**/.idea/**,**/.vscode/**,**/.angular/**,**/dist/**,**/out/**,**/build/**,**/coverage/**,**/tmp/**,**/.cache/**}";

	const uris = await vscode.workspace.findFiles(include, exclude, 12000);

	// Cache
	const root = vscode.workspace.workspaceFolders?.[0]?.uri;
	const cache: CacheData = root
		? await readCache(root)
		: ({ version: 1, files: {} } satisfies CacheData);

	const updated: string[] = [];

	const concurrency = 25; // balance entre I/O (Input/Output: entrada/saída)
	let cursor = 0;

	async function processFile(uri: vscode.Uri, index: number) {
		try {
			// Consulta stat primeiro para decidir abrir ou não
			const stat = await vscode.workspace.fs.stat(uri);
			const key = uri.fsPath;
			const prev = cache.files[key];

			if (prev && prev.mtime === stat.mtime) {
				for (const h of prev.hits) {
					hits.push({ file: key, line: h.line, text: h.text });
				}

				reused += prev.hits.length;
				return;
			}

			// Abrir documento apenas se necessário
			const doc = await vscode.workspace.openTextDocument(uri);

			if (doc.lineCount > 6000) {
				return;
			}

			const localHits: { line: number; text: string }[] = [];

			for (let i = 0; i < doc.lineCount; i++) {
				const text = doc.lineAt(i).text;

				if (text.includes("@TODO") && pattern.test(text)) {
					const idx = text.indexOf("@TODO");
					const extract = text.substring(idx).trim();

					localHits.push({ line: i, text: extract });

					hits.push({ file: key, line: i, text: extract });
				}
			}

			scanned += localHits.length;
			cache.files[key] = { mtime: stat.mtime, hits: localHits };

			updated.push(key);
		} catch {
			// ignora
		}
	}

	async function worker() {
		while (true) {
			const i = cursor++;

			if (i >= uris.length) {
				break;
			}

			if (token?.isCancellationRequested) {
				return;
			}

			await processFile(uris[i], i);

			if (progress) {
				const processed = i + 1;
				const total = uris.length;
				const percent = (processed / total) * 100;

				const message = `${percent.toFixed(1)}% (${processed}/${total})`;

				progress.report({ increment: 0, message });
			}
		}
	}

	await Promise.all(Array.from({ length: concurrency }, worker));

	if (token?.isCancellationRequested) {
		return { hits, reused, scanned };
	}

	if (root && updated.length) {
		// grava cache (melhor esforço)
		writeCache(root, cache).catch(() => undefined);
	}

	return { hits, reused, scanned };
}

async function persistResults(results: TodoHit[]): Promise<void> {
	if (!vscode.workspace.workspaceFolders?.length) {
		return;
	}

	const folder = vscode.workspace.workspaceFolders[0].uri; // assume single root
	const dir = vscode.Uri.joinPath(folder, ".todo-board");
	const file = vscode.Uri.joinPath(dir, "todos.json");
	const encoder = new TextEncoder();

	try {
		await vscode.workspace.fs.createDirectory(dir);
		await vscode.workspace.fs.writeFile(
			file,
			encoder.encode(JSON.stringify(results, null, 2)),
		);
	} catch {
		// silencioso por enquanto
	}
}
