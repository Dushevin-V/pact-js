const { Verifier } = require('@pact-foundation/pact');
const {generateToken} = require("./actions");

describe('Pact Verification', () => {
  test('should validate the expectations of BooksConsumer', () => {

    const opts = {
      logLevel: "INFO",
      providerBaseUrl: process.env.BASE_URL,
      provider: "BooksProvider",
      providerVersion: "1.0.1",
      providerVersionTags: ["test"],
      pactBrokerUrl : process.env.PACT_BROKER_BASE_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,

      requestFilter: (req, res, next) => {
        if (!req.headers["Authorization"]) {
          next();
          return;
        }
        req.headers["Authorization"] = `Bearer ${generateToken()}`;
        next();
      },
      publishVerificationResult: true,
    };

    const verifier = new Verifier(opts);
    return verifier.verifyProvider();
  });
});
