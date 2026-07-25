import { expect, test, type Page } from "@playwright/test";

async function enterLocalReview(page: Page, next = "/app") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page
    .getByRole("button", { name: "Continue in local review mode" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${next.replace(/\//g, "\\/")}$`));
}

async function openPublicPage(page: Page, linkName: string) {
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) {
    await menu.click();
  }
  await page.getByRole("link", { name: linkName }).click();
}

test("public website works page by page with clear product boundaries", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /unemployment dataset.*latent founders/i }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "What if the next great local employer is currently standing in an unemployment line?",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Start at zero. Earn every outcome." }),
  ).toBeVisible();
  await expect(page.locator(".public-header .founder-dna-icon")).toBeVisible();
  await expect(page.getByText("No fabricated traction")).toBeVisible();

  await openPublicPage(page, "Platform");
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(
    page.getByRole("heading", { name: "From lived experience to market evidence." }),
  ).toBeVisible();

  await openPublicPage(page, "Trust");
  await expect(page).toHaveURL(/\/method$/);
  await expect(
    page.getByText("No success-prediction claim until a real longitudinal study supports it."),
  ).toBeVisible();

  await page.goto("/privacy");
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole("heading", { name: "Your founder story should remain yours." }),
  ).toBeVisible();
});

test("reviewer narrative, interactive walkthrough, and agency planner are functional", async ({
  page,
}) => {
  await page.goto("/#live-example");
  await expect(
    page.getByRole("heading", {
      name: "See one founder move from uncertainty to a testable company.",
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /03.*Validate/i }).click();
  await expect(
    page.getByRole("heading", { name: "Ask the market before building the product." }),
  ).toBeVisible();
  await expect(page.getByText("Synthetic demo evidence")).toBeVisible();

  await page.goto("/judges");
  await expect(
    page.getByRole("heading", {
      name: "Founder DNA turns overlooked potential into evidence-backed employers.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Working in this build")).toBeVisible();
  await expect(page.getByText("Must be validated next")).toBeVisible();

  await page.goto("/agencies#pilot-planner");
  await page.getByPlaceholder("Example Workforce Partnership").fill("Northside Workforce");
  await page.getByPlaceholder("City, state, or service area").fill("Cleveland, OH");
  await page.getByRole("button", { name: "Prepare discovery brief" }).click();
  await expect(page.getByText("Discovery brief prepared")).toBeVisible();
  await expect(page.getByText(/Northside Workforce/)).toBeVisible();

  const frameworkLink = page.getByRole("link", {
    name: /Download pilot framework/i,
  });
  await expect(frameworkLink).toHaveAttribute(
    "href",
    "/Founder-DNA-Agency-Pilot-Blueprint.pdf",
  );
  const framework = await page.request.get(
    "/Founder-DNA-Agency-Pilot-Blueprint.pdf",
  );
  expect(framework.ok()).toBeTruthy();
  expect((await framework.body()).subarray(0, 4).toString()).toBe("%PDF");

  await page.goto("/foundry");
  await expect(
    page.getByRole("heading", {
      name: "Every roadmap item has a gate, owner decision, and visible boundary.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Pilot months 2–3")).toBeVisible();
});

test("workspace routes require login and local review is explicitly labeled", async ({
  page,
}) => {
  await page.goto("/app/proof");
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(
    page.getByRole("heading", { name: "Continue your fieldwork." }),
  ).toBeVisible();
  await expect(page.getByText("Development only · never enabled in production")).toBeVisible();

  await page
    .getByRole("button", { name: "Continue in local review mode" })
    .click();
  await expect(page).toHaveURL(/\/app\/proof$/);
  await expect(
    page.getByRole("heading", { name: "Business proof ledger" }),
  ).toBeVisible();
  await expect(page.getByText("No evidence recorded yet")).toBeVisible();
});

test("dark mode persists across pages and reloads", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await openPublicPage(page, "Platform");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("completes the full scenario assessment and creates a transparent profile", async (
  { page },
  testInfo,
) => {
  test.skip(
    testInfo.project.name.includes("mobile"),
    "The full completion path is covered once on desktop.",
  );

  await enterLocalReview(page, "/app/assessment");

  await page.getByLabel("Your name").fill("Taylor Morgan");
  await page.getByLabel("City").fill("Denver");
  await page.getByLabel("State / region").fill("CO");
  await page.getByLabel("Industry you know best").fill("Community health");
  await page.getByRole("button", { name: "Begin the assessment" }).click();

  for (let index = 0; index < 9; index += 1) {
    await page.getByRole("radio").first().click();
    if (index === 8) {
      await page
        .getByPlaceholder("Use your own words. This helps the blueprint sound like you.")
        .fill("I have coordinated neighborhood health access for years.");
      await page.getByRole("button", { name: "Reveal my Founder DNA" }).click();
    } else {
      await page.getByRole("button", { name: "Continue" }).click();
    }
  }

  await expect(page.getByText("Profile complete")).toBeVisible();
  await expect(page.getByText(/Your pattern:/)).toBeVisible();
  await expect(
    page.getByText("I have coordinated neighborhood health access for years."),
  ).toBeVisible();

  await page.goto("/app/blueprint");
  await expect(page.getByText("Founder validation brief · v1")).toBeVisible();
  await expect(page.getByText("Assessment signal—not a percentile")).toBeVisible();
});

test("mobile workspace navigation and settings work smoothly", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Mobile navigation behavior only.",
  );

  await enterLocalReview(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Proof Ledger" }).click();

  await expect(
    page.getByRole("heading", { name: "Business proof ledger" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: /Local reviewer/ }).click();
  await expect(
    page.getByRole("heading", { name: "Workspace settings" }),
  ).toBeVisible();
  await expect(page.getByText("Local review session")).toBeVisible();
});

test("co-founder matching supports onboarding, discovery, profiles, and communication", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes("mobile"),
    "The complete matching interaction path is covered on desktop.",
  );

  await enterLocalReview(page, "/app/matches");
  await expect(
    page.getByRole("heading", {
      name: "Find the founder who strengthens the team—not your mirror image.",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Complete profile" }).click();
  await expect(page.getByRole("heading", { name: "How do you create value?" })).toBeVisible();
  await page.getByRole("button", { name: /Technical.*Product, engineering, and data/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "What can a teammate rely on you to own?" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByPlaceholder("I believe overlooked local operators can...").fill(
    "I believe local operators can build stronger companies with evidence.",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Preview my profile" }).click();
  await expect(page.getByText("Ready to preview")).toBeVisible();
  await page.getByRole("button", { name: /Publish to network/ }).click();
  await expect(
    page.getByText("Profile published to signed-in founder discovery."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Grid" }).click();
  await page.getByLabel("Founder track").selectOption("Technical");
  await expect(page.getByRole("heading", { name: /Amara Okafor/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Jonah Lee/ })).toHaveCount(0);

  await page.getByRole("button", { name: "View profile" }).click();
  await expect(page.getByText("60-second founder pitch")).toBeVisible();
  await expect(page.getByText("Complementarity map")).toBeVisible();

  await page.getByRole("button", { name: /Messages/ }).click();
  await page.getByRole("button", { name: "Schedule a 15-min intro" }).click();
  await page.getByRole("textbox", { name: "Message" }).press("Enter");
  await expect(
    page.getByRole("paragraph").filter({ hasText: "Schedule a 15-min intro" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "1:00 PM" }).click();
  await page.getByRole("button", { name: "Hold this time" }).click();
  await expect(page.getByText(/Calendar write requires production integration/)).toBeVisible();
});

test("unknown pages have a useful recovery path", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "This path has no evidence yet." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("expired password recovery links fail safely", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(
    page.getByRole("heading", {
      name: "This recovery link is invalid or expired.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Return to sign in/ }),
  ).toBeVisible();
});
