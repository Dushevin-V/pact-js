const { Verifier } = require('@pact-foundation/pact');
const {generateToken} = require("./actions");

describe('Pact Verification', () => {
  test('should validate the expectations of BooksConsumer', () => {

    const opts = {
      logLevel: "INFO",
      providerBaseUrl: "https://simple-books-api.glitch.me",
      provider: "BooksProvider",
      providerVersion: "1.0.0",
      providerVersionTags: ["test"],
      pactBrokerUrl : "https://vaasd.pactflow.io",
      pactBrokerToken: "78zSRQLVNfYUO8EEaxCh4w",
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
