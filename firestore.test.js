const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ALICE_UID = "alice_123";
const BOB_UID = "bob_456";

const [emulatorHost, emulatorPortStr] = (
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085"
).split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

function pastTimestamp() {
  return new Date(Date.now() - 2000);
}

function validTemplatePayload(authorId, overrides = {}) {
  const ts = pastTimestamp();
  return {
    authorId,
    authorName: "Alice Designer",
    title: "Logo Minimalista",
    description: "Vetor editável para identidade visual.",
    category: "Logo",
    dimensionsLabel: "1080 x 1080 px",
    previewAccentHex: "#2680EB",
    novaJson: "{\"id\":\"doc1\",\"name\":\"Logo\"}",
    isPublic: true,
    likesCount: 0,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("Unauthenticated user cannot read or write any collection", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthDb.collection("users").doc(ALICE_UID).get());
  await assertFails(
    unauthDb.collection("community_templates").where("isPublic", "==", true).get()
  );
  await assertFails(
    unauthDb.collection("users").doc(ALICE_UID).collection("cloud_projects").get()
  );
  await assertFails(
    unauthDb.collection("community_templates").doc("tpl_1").set(validTemplatePayload(ALICE_UID))
  );
});

test("User PII isolation: Alice cannot read or write Bob's /users/{bob} document", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const ts = pastTimestamp();
    await ctx.firestore().collection("users").doc(BOB_UID).set({
      userId: BOB_UID,
      displayName: "Bob",
      email: "bob@example.com",
      createdAt: ts,
      updatedAt: ts,
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const ts = pastTimestamp();
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).set({
      userId: ALICE_UID,
      displayName: "Alice",
      email: "alice@example.com",
      createdAt: ts,
      updatedAt: ts,
    })
  );
  await assertFails(aliceDb.collection("users").doc(BOB_UID).get());
  await assertFails(
    aliceDb.collection("users").doc(BOB_UID).update({ displayName: "Hacked", updatedAt: pastTimestamp() })
  );
});

test("Cloud projects: Owner can CRUD own projects; cross-user fails", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();

  const aliceProjRef = aliceDb
    .collection("users")
    .doc(ALICE_UID)
    .collection("cloud_projects")
    .doc("proj_1");

  const ts = pastTimestamp();
  await assertSucceeds(
    aliceProjRef.set({
      userId: ALICE_UID,
      name: "Projeto 1",
      artboardSummary: "1 prancheta · 1080×1080",
      objectCount: 4,
      novaJson: "{\"id\":\"proj_1\"}",
      createdAt: ts,
      updatedAt: ts,
    })
  );

  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).collection("cloud_projects").get()
  );

  await assertFails(
    bobDb
      .collection("users")
      .doc(ALICE_UID)
      .collection("cloud_projects")
      .doc("proj_1")
      .get()
  );
  await assertFails(
    bobDb.collection("users").doc(ALICE_UID).collection("cloud_projects").get()
  );
});

test("Community templates: create validates schema, rejects shadow fields & spoofed authorId", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Valid create
  await assertSucceeds(
    aliceDb
      .collection("community_templates")
      .doc("tpl_valid")
      .set(validTemplatePayload(ALICE_UID))
  );

  // Spoofed authorId
  await assertFails(
    aliceDb
      .collection("community_templates")
      .doc("tpl_spoof")
      .set(validTemplatePayload(BOB_UID))
  );

  // Shadow field
  await assertFails(
    aliceDb
      .collection("community_templates")
      .doc("tpl_shadow")
      .set(validTemplatePayload(ALICE_UID, { isVerified: true }))
  );

  // Non-zero initial likes
  await assertFails(
    aliceDb
      .collection("community_templates")
      .doc("tpl_likes")
      .set(validTemplatePayload(ALICE_UID, { likesCount: 99 }))
  );

  // Invalid category
  await assertFails(
    aliceDb
      .collection("community_templates")
      .doc("tpl_cat")
      .set(validTemplatePayload(ALICE_UID, { category: "Invalido" }))
  );
});

test("Community templates: query alignment & non-author update/delete isolation", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();

  await assertSucceeds(
    aliceDb
      .collection("community_templates")
      .doc("tpl_pub")
      .set(validTemplatePayload(ALICE_UID, { isPublic: true }))
  );
  await assertSucceeds(
    aliceDb
      .collection("community_templates")
      .doc("tpl_priv")
      .set(validTemplatePayload(ALICE_UID, { isPublic: false }))
  );

  // Aligned public query succeeds for Bob
  await assertSucceeds(
    bobDb.collection("community_templates").where("isPublic", "==", true).get()
  );

  // Unfiltered list fails for Bob because private doc exists
  await assertFails(bobDb.collection("community_templates").get());

  // Bob cannot update or delete Alice's template
  await assertFails(
    bobDb.collection("community_templates").doc("tpl_pub").update({
      title: "Alterado por Bob",
      updatedAt: pastTimestamp(),
    })
  );
  await assertFails(bobDb.collection("community_templates").doc("tpl_pub").delete());

  // Alice can update her own template metadata
  await assertSucceeds(
    aliceDb.collection("community_templates").doc("tpl_pub").update({
      title: "Logo Atualizado",
      updatedAt: pastTimestamp(),
    })
  );
});

test("Community likes: requires atomic batch with likes/{uid} and blocks rogue likesCount tampering", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();

  await assertSucceeds(
    aliceDb
      .collection("community_templates")
      .doc("tpl_like")
      .set(validTemplatePayload(ALICE_UID))
  );

  // Non-atomic increment without likes doc must fail
  await assertFails(
    bobDb.collection("community_templates").doc("tpl_like").update({
      likesCount: 1,
      updatedAt: pastTimestamp(),
    })
  );

  // Atomic batch like succeeds
  const likeBatch = bobDb.batch();
  const tplRef = bobDb.collection("community_templates").doc("tpl_like");
  const likeRef = tplRef.collection("likes").doc(BOB_UID);
  likeBatch.set(likeRef, { userId: BOB_UID, createdAt: pastTimestamp() });
  likeBatch.update(tplRef, {
    likesCount: 1,
    updatedAt: pastTimestamp(),
  });
  await assertSucceeds(likeBatch.commit());

  // Atomic batch unlike succeeds
  const unlikeBatch = bobDb.batch();
  unlikeBatch.delete(likeRef);
  unlikeBatch.update(tplRef, {
    likesCount: 0,
    updatedAt: pastTimestamp(),
  });
  await assertSucceeds(unlikeBatch.commit());
});
