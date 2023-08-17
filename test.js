const { suite } = require("uvu");
const assert = require("uvu/assert");

const nock = require("nock");
nock.disableNetConnect();

const {
  Probot,
  ProbotOctokit,
} = require("@probot/adapter-aws-lambda-serverless");

const app = require("./app");

/** @type {import('probot').Probot */
let probot;
const test = suite("app");
test.before.each(() => {
  probot = new Probot({
    // simple authentication as alternative to appId/privateKey
    githubToken: "test",
    // disable logs
    logLevel: "warn",
    // disable request throttling and retries
    Octokit: ProbotOctokit.defaults({
      throttle: { enabled: false },
      retry: { enabled: false },
    }),
  });
  probot.load(app);
});

test("recieves issues.opened event", async function () {
  const mock = nock("https://api.github.com")
    // create new check run
    .post(
      "/repos/robandpdx/cd-demo/actions/runs/5896124763/deployment_protection_rule",
      (requestBody) => {
        assert.equal(requestBody, { 
          environment_name: "cd-production",
          state: "approved",
          comment: "Deployment approved by external system"
        });

        return true;
      }
    )
    .reply(201, {});

  await probot.receive({
    name: "deployment_protection_rule",
    payload: {
      action: "requested",
      environment: "cd-production",
      deployment_callback_url: "https://api.github.com/repos/robandpdx/cd-demo/actions/runs/5896124763/deployment_protection_rule"
    },
  });

  assert.equal(mock.activeMocks(), []);
});

test.run();
