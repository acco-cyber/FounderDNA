import assert from "node:assert/strict";
import test from "node:test";
import { requireAuth } from "./auth.mjs";

test("development local review creates an explicit isolated identity", async () => {
  const request = {
    get(name) {
      return name.toLowerCase() === "x-founder-local-review" ? "1" : "";
    },
  };
  let continued = false;

  await requireAuth(
    request,
    {},
    () => {
      continued = true;
    },
  );

  assert.equal(continued, true);
  assert.deepEqual(request.user, {
    uid: "local-reviewer",
    email: "review@localhost",
    name: "Local reviewer",
    provider: "local-review",
    admin: true,
  });
});
