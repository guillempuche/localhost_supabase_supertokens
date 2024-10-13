import type { Context } from "hono";
import { Pool } from "postgres";
import Session from "supertokens-node/recipe/session";

const SUPABASE_PG_USER = Deno.env.get("SUPABASE_PG_USER") || "";
const SUPABASE_PG_PASSWORD = Deno.env.get("SUPABASE_PG_PASSWORD") || "";
const SUPABASE_PG_NAME = Deno.env.get("SUPABASE_PG_NAME") || "";
const SUPABASE_PG_HOST = Deno.env.get("SUPABASE_PG_HOST") || "";
const SUPABASE_PG_PORT = Deno.env.get("SUPABASE_PG_PORT") || "";

const POOL_CONNECTIONS = 10;
const connectionPool = new Pool(
	{
		user: SUPABASE_PG_USER,
		password: SUPABASE_PG_PASSWORD,
		database: SUPABASE_PG_NAME,
		hostname: SUPABASE_PG_HOST,
		port: Number(SUPABASE_PG_PORT),
	},
	POOL_CONNECTIONS,
);

// ===============================
// User utils
// ===============

export const getUserProfile = async (c: Context) => {
	const session = c.req.session;
	if (!session) {
		return c.text("Unauthorized", 401);
	}

	const userId = session.getUserId();
	// Fetch and return user profile using userId
};

// ===============================
// Explorer handlers
// ===============

export async function getAllExplorers(c: Context) {
	const client = await connectionPool.connect();
	try {
		const result = await client.queryObject("SELECT * FROM explorers");
		return c.json(result.rows);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function getExplorer(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		const result = await client.queryObject(
			`SELECT * FROM explorers WHERE id = ${id}`,
		);
		if (result.rows.length === 0) {
			return c.json({ error: "Explorer not found" }, 404);
		}
		return c.json(result.rows[0]);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function createExplorer(c: Context) {
	const client = await connectionPool.connect();
	try {
		const { username, email } = await c.req.json();
		const id = crypto.randomUUID();
		const created_at = new Date().toISOString();
		await client.queryObject(
			`INSERT INTO explorers (id, username, email, created_at) VALUES (${id}, ${username}, ${email}, ${created_at})`,
		);
		return c.json({ id, username, email, created_at }, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function updateExplorer(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		const updates = await c.req.json();
		const fields = [];
		const values = [];
		let idx = 1;

		for (const [key, value] of Object.entries(updates)) {
			fields.push(`${key} = $${idx++}`);
			values.push(value);
		}

		if (fields.length === 0) {
			return c.json({ error: "No fields to update" }, 400);
		}

		values.push(id);
		const query = `UPDATE explorers SET ${fields.join(", ")} WHERE id = $${idx}`;
		await client.queryObject(query, ...values);
		return c.json({ message: "Explorer updated" });
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function deleteExplorer(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		await client.queryObject(`DELETE FROM explorers WHERE id = ${id}`);
		return c.text("Deleted", 200);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

// ===============================
// Topics handlers
// ===============

export async function getAllTopics(c: Context) {
	const client = await connectionPool.connect();
	try {
		const result = await client.queryObject("SELECT * FROM topics");
		return c.json(result.rows);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function getTopic(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		const result = await client.queryObject(
			`SELECT * FROM topics WHERE id = ${id}`,
		);
		if (result.rows.length === 0) {
			return c.json({ error: "Topic not found" }, 404);
		}
		return c.json(result.rows[0]);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function createTopic(c: Context) {
	const client = await connectionPool.connect();
	try {
		const { name, description, explorer_id } = await c.req.json();
		const id = crypto.randomUUID();
		const created_at = new Date().toISOString();
		await client.queryObject(
			`INSERT INTO topics (id, name, description, created_at, explorer_id) VALUES (${id}, ${name}, ${description}, ${created_at}, ${explorer_id})`,
		);
		return c.json({ id, name, description, created_at, explorer_id }, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function updateTopic(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		const updates = await c.req.json();
		const fields = [];
		const values = [];
		let idx = 1;

		for (const [key, value] of Object.entries(updates)) {
			fields.push(`${key} = $${idx++}`);
			values.push(value);
		}

		if (fields.length === 0) {
			return c.json({ error: "No fields to update" }, 400);
		}

		values.push(id);
		const query = `UPDATE topics SET ${fields.join(", ")} WHERE id = $${idx}`;
		await client.queryObject(query, ...values);
		return c.json({ message: "Topic updated" });
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function deleteTopic(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		await client.queryObject(`DELETE FROM topics WHERE id = ${id}`);
		return c.text("Deleted", 200);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

// ===============================
// Device handlers
// ===============

export async function getAllDevices(c: Context) {
	const client = await connectionPool.connect();
	try {
		const result = await client.queryObject("SELECT * FROM devices");
		return c.json(result.rows);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function getDevice(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		const result = await client.queryObject(
			`SELECT * FROM devices WHERE id = ${id}`,
		);
		if (result.rows.length === 0) {
			return c.json({ error: "Device not found" }, 404);
		}
		return c.json(result.rows[0]);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function createDevice(c: Context) {
	const client = await connectionPool.connect();
	try {
		const { explorer_id, device_name } = await c.req.json();
		const id = crypto.randomUUID();
		const created_at = new Date().toISOString();
		await client.queryObject(
			`INSERT INTO devices (id, explorer_id, device_name, created_at) VALUES (${id}, ${explorer_id}, ${device_name}, ${created_at})`,
		);
		return c.json({ id, explorer_id, device_name, created_at }, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function updateDevice(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		const updates = await c.req.json();
		const fields = [];
		const values = [];
		let idx = 1;

		for (const [key, value] of Object.entries(updates)) {
			fields.push(`${key} = $${idx++}`);
			values.push(value);
		}

		if (fields.length === 0) {
			return c.json({ error: "No fields to update" }, 400);
		}

		values.push(id);
		const query = `UPDATE devices SET ${fields.join(", ")} WHERE id = $${idx}`;
		await client.queryObject(query, ...values);
		return c.json({ message: "Device updated" });
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

export async function deleteDevice(c: Context) {
	const client = await connectionPool.connect();
	try {
		const id = c.req.param("id");
		await client.queryObject(`DELETE FROM devices WHERE id = ${id}`);
		return c.text("Deleted", 200);
	} catch (error) {
		console.error(error);
		return c.json({ error: error.message }, 500);
	} finally {
		client.release();
	}
}

// ===============================
// Session handler
// ===============

export async function getSessions(c: Context) {
	try {
		const session = c.req.session;
		if (!session) {
			return c.text("Unauthorized", 401);
		}

		const userId = session.getUserId();
		const sessionHandles = await Session.getAllSessionHandlesForUser(userId);

		const sessions = await Promise.all(
			sessionHandles.map(async (handle) => {
				const sessionInfo = await Session.getSessionInformation(handle);
				return {
					handle,
					userId: sessionInfo.userId,
					expiry: sessionInfo.expiry,
				};
			}),
		);

		return c.json(sessions);
	} catch (error) {
		console.error("Session error:", error);
		return c.text("Unauthorized", 401);
	}
}
