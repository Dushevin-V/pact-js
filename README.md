# PactJS Contract Testing Example

Another example test framework using Pact-js to validate contract testing between consumer and provider. The application under testing is a book store API (https://simple-books-api.glitch.me).

Base framework is borrowed from the ["PactJS Contract Testing Example"](https://www.mariedrake.com/post/contract-testing-with-pact-js-and-jest) (actual repo https://github.com/mdcruz/pact-js-example)

## Installing dependencies

Install dependencies
`npm i`

The framework is using [Pactflow](https://pactflow.io/) as pact broker. 

To use Pactflow, register for their free developer plan and export your Pactflow Broker URL and API token:


## Note

Current framework has a major flaw. As it utilises an existing book API, order ID used in consumer tests should also be real. 
So before running the consumer part be sure to update the const orderID either with a new order ID or utilise the existing one. 
 

## Running the tests

Run the consumer tests:
`npm run test:consumer`

Publish the contract to your pact broker:
`npm run publish:pact`

Run the provider tests
`npm run test:provider`
