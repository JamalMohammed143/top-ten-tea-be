import test, { describe, before, after } from "node:test";
import assert from "node:assert";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import app from "../app";

describe("Express API Integration Tests", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  test("GET / responds with status 200 and running message", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.strictEqual(text, "Top Ten Tea API is running");
  });

  test("POST /auth/login returns 400 when body is empty", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as { success: boolean; message: string };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, "Please provide an email and password");
  });

  test("POST /auth/login returns 400 when password is missing", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com" }),
    });
    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as { success: boolean; message: string };
    assert.strictEqual(body.success, false);
  });

  test("Protected route GET /admin/products returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/admin/products`);
    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as { success: boolean; message: string };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, "Not authorized to access this route");
  });

  test("Protected route GET /delivery/assigned-products returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/delivery/assigned-products`);
    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as { success: boolean; message: string };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, "Not authorized to access this route");
  });

  test("Protected route with invalid Bearer token returns 401", async () => {
    const res = await fetch(`${baseUrl}/admin/products`, {
      headers: { Authorization: "Bearer invalid.token.value" },
    });
    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as { success: boolean; message: string };
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, "Not authorized to access this route");
  });
});
