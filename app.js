/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log("Yay! The app was loaded!");

  app.on("deployment_protection_rule.requested", async (context) => {
    console.log("deployment_protection_rule.requested")

    var environment = context.payload.environment;
    var deployment_callback_url = context.payload.deployment_callback_url;

    // TODO: Insert your logic here.
    if (process.env.APPROVE == "true") {
      console.log("Approving deployment")
      state = "approved"
      comment = "Deployment approved by external system"
    } else {
      console.log("Rejecting deployment")
      state = "rejected"
      comment = "Deployment rejected by external system"
    }

    return context.octokit.request(`POST ${deployment_callback_url}`, {
      environment_name: environment,
      state: state,
      comment: comment
    })
  });
};
