import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

export interface VellumAdmin {
	id: string;
	name: string;
	email: string;
	cpf: string;
	created_at: string;
	updated_at: string;
}

export interface VellumEvent {
	id: string;
	admin_id: string;
	title: string;
	description: string | null;
	logo_url: string | null;
	theme_color: string;
	starts_at: string;
	ends_at: string;
	cert_template_url: string;
	cert_config: string; // JSON
	organizer_name?: string;
	organizer_cpf?: string;
	created_at: string;
	updated_at: string;
}

export interface VellumAttendance {
	id: string;
	event_id: string;
	participant_name: string;
	participant_email: string;
	checked_in_at: string;
}

export interface VellumMagicLink {
	id: string;
	admin_id: string;
	token_hash: string;
	expires_at: string;
	used_at: string | null;
	created_at: string;
}

// Interface unificada compatível com D1
export interface DatabaseClient {
	prepare: (query: string) => PreparedStatement;
	batch?: (statements: PreparedStatement[]) => Promise<any[]>;
	exec: (query: string) => Promise<any> | any;
}

export interface PreparedStatement {
	bind: (...values: any[]) => PreparedStatement;
	first: <T = unknown>(colName?: string) => Promise<T | null>;
	all: <T = unknown>() => Promise<{ results: T[]; success: boolean }>;
	run: () => Promise<{ success: boolean; meta?: any }>;
}

export const INITIAL_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    cpf TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`,
	`CREATE TABLE IF NOT EXISTS magic_links (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  )`,
	`CREATE INDEX IF NOT EXISTS idx_magic_links_hash ON magic_links(token_hash)`,
	`CREATE INDEX IF NOT EXISTS idx_magic_links_admin_id ON magic_links(admin_id)`,
	`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    theme_color TEXT NOT NULL DEFAULT '#4b5563',
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    cert_template_url TEXT NOT NULL,
    cert_config TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  )`,
	`CREATE INDEX IF NOT EXISTS idx_events_admin_id ON events(admin_id)`,
	`CREATE INDEX IF NOT EXISTS idx_events_dates ON events(starts_at, ends_at)`,
	`CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL COLLATE NOCASE,
    checked_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE (event_id, participant_email)
  )`,
	`CREATE INDEX IF NOT EXISTS idx_attendances_event_id ON attendances(event_id)`
];

let d1Initialized = false;

async function ensureD1Schema(db: DatabaseClient) {
	if (d1Initialized) return;
	try {
		const test = await db
			.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'")
			.first();
		if (!test) {
			for (const stmt of INITIAL_STATEMENTS) {
				await db.prepare(stmt).run();
			}
		}
		d1Initialized = true;
	} catch (err) {
		console.warn('Erro ao verificar/inicializar esquema D1:', err);
	}
}

// Local SQLite singleton using Node 24 built-in node:sqlite
let localDbInstance: any = null;

function getLocalDatabase(): DatabaseClient {
	if (!localDbInstance) {
		const req = createRequire(import.meta.url);
		const { DatabaseSync } = req('node:sqlite');
		const dbDir = resolve(process.cwd(), '.data');
		if (!existsSync(dbDir)) {
			mkdirSync(dbDir, { recursive: true });
		}
		const dbPath = resolve(dbDir, 'vellum_dev.sqlite');
		const sqlite = new DatabaseSync(dbPath);

		// Executa pragmas e migrações iniciais
		sqlite.exec('PRAGMA foreign_keys = ON;');
		for (const stmt of INITIAL_STATEMENTS) {
			sqlite.exec(stmt);
		}

		// Cria admin padrão de teste se não existir
		try {
			const checkAdmin = sqlite.prepare('SELECT id FROM admins WHERE email = ?');
			const existing = checkAdmin.get('admin@vellum.local');
			if (!existing) {
				const insertAdmin = sqlite.prepare(
					'INSERT INTO admins (id, name, email, cpf) VALUES (?, ?, ?, ?)'
				);
				insertAdmin.run(
					'admin-demo-id',
					'Organizador Vellum',
					'admin@vellum.local',
					'000.000.000-00'
				);
			}
		} catch (err) {
			console.warn('Erro ao inicializar admin de desenvolvimento:', err);
		}

		localDbInstance = sqlite;
	}

	return {
		prepare(sql: string): PreparedStatement {
			let boundParams: any[] = [];
			const stmt = localDbInstance.prepare(sql);

			const prepared: PreparedStatement = {
				bind(...values: any[]) {
					boundParams = values;
					return prepared;
				},
				async first<T = unknown>(colName?: string): Promise<T | null> {
					const row = stmt.get(...boundParams) as any;
					if (!row) return null;
					if (colName) return row[colName] as T;
					return row as T;
				},
				async all<T = unknown>(): Promise<{ results: T[]; success: boolean }> {
					const rows = stmt.all(...boundParams) as T[];
					return {
						results: rows || [],
						success: true
					};
				},
				async run(): Promise<{ success: boolean; meta?: any }> {
					const info = stmt.run(...boundParams);
					return {
						success: true,
						meta: {
							changes: info.changes,
							last_row_id: info.lastInsertRowid
						}
					};
				}
			};

			return prepared;
		},
		exec(sql: string) {
			return localDbInstance.exec(sql);
		}
	};
}

/**
 * Obtém a conexão com o banco de dados.
 * Se platform?.env?.DB estiver presente (Cloudflare Pages/Workers ou Miniflare no Vite), utiliza o D1 nativo garantindo o schema.
 * Caso contrário, utiliza o SQLite local com node:sqlite integrado no Node 24.
 */
export function getDb(platform?: App.Platform): DatabaseClient {
	if (platform?.env?.DB) {
		const rawDb = platform.env.DB as unknown as DatabaseClient;
		return {
			prepare(query: string): PreparedStatement {
				const stmt = rawDb.prepare(query);
				const createBoundWrapper = (boundStmt: any): PreparedStatement => ({
					bind(...values: any[]) {
						return createBoundWrapper(boundStmt.bind(...values));
					},
					async first<T = unknown>(col?: string) {
						await ensureD1Schema(rawDb);
						return boundStmt.first(col);
					},
					async all<T = unknown>() {
						await ensureD1Schema(rawDb);
						return boundStmt.all();
					},
					async run() {
						await ensureD1Schema(rawDb);
						return boundStmt.run();
					}
				});

				return {
					bind(...values: any[]) {
						return createBoundWrapper(stmt.bind(...values));
					},
					async first<T = unknown>(col?: string) {
						await ensureD1Schema(rawDb);
						return stmt.first(col);
					},
					async all<T = unknown>() {
						await ensureD1Schema(rawDb);
						return stmt.all();
					},
					async run() {
						await ensureD1Schema(rawDb);
						return stmt.run();
					}
				};
			},
			exec(sql: string) {
				return rawDb.exec(sql);
			}
		};
	}
	return getLocalDatabase();
}
