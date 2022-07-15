const { Pact } = require('@pact-foundation/pact');
const { like } = require('@pact-foundation/pact').Matchers;
const path = require('path');
const {API} = require("./consumer");

const provider = new Pact({
  consumer: "BooksConsumer",
  provider: "BooksProvider",
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), 'pacts'),
});

let token
const orderID = "IZHjQng8GLiGaRnDqo3xL"

describe("API Pact test", () => {

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe("request status", () => {
    test("status is ok", async () => {

      // set up Pact interactions
      await provider.addInteraction({
        state: 'status is ok',
        uponReceiving: 'request status',
        withRequest: {
          method: 'GET',
          path: '/status',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            "status": "OK"
          }
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const status = await api.requestStatus();

      expect(status).toEqual({"status": "OK"});

    });
  })

  describe("getting all books", () => {
    test("books exist", async () => {

      // set up Pact interactions
      await provider.addInteraction({
        state: 'books exist',
        uponReceiving: 'get all books',
        withRequest: {
          method: 'GET',
          path: '/books',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: [
            {
              "id": 1,
              "name": "The Russian",
              "type": "fiction",
              "available": true
            },
            {
              "id": 2,
              "name": "Just as I Am",
              "type": "non-fiction",
              "available": false
            },
            {
              "id": 3,
              "name": "The Vanishing Half",
              "type": "fiction",
              "available": true
            },
            {
              "id": 4,
              "name": "The Midnight Library",
              "type": "fiction",
              "available": true
            },
            {
              "id": 5,
              "name": "Untamed",
              "type": "non-fiction",
              "available": true
            },
            {
              "id": 6,
              "name": "Viscount Who Loved Me",
              "type": "fiction",
              "available": true
            }
          ]
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const books = await api.getAllBooks();

      expect(books).toEqual([
        {
          "id": 1,
          "name": "The Russian",
          "type": "fiction",
          "available": true
        },
        {
          "id": 2,
          "name": "Just as I Am",
          "type": "non-fiction",
          "available": false
        },
        {
          "id": 3,
          "name": "The Vanishing Half",
          "type": "fiction",
          "available": true
        },
        {
          "id": 4,
          "name": "The Midnight Library",
          "type": "fiction",
          "available": true
        },
        {
          "id": 5,
          "name": "Untamed",
          "type": "non-fiction",
          "available": true
        },
        {
          "id": 6,
          "name": "Viscount Who Loved Me",
          "type": "fiction",
          "available": true
        }
      ]);
    });

  });

  describe("getting books by id", () => {
    test("books ID 2 exists", async () => {
      const id = 2
      const body =  {
        "id": 2,
        "name": "Just as I Am",
        "type": "non-fiction",
        "available": false
      }
      // set up Pact interactions
      await provider.addInteraction({
        state: 'book with ID 2 exists',
        uponReceiving: 'get book with ID 2',
        withRequest: {
          method: 'GET',
          path: `/books/${id}`,
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: body,
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const company = await api.getSingleBook(id);

      expect(company).toStrictEqual(body);
    });

    test("book does not exist", async () => {

      // set up Pact interactions
      await provider.addInteraction({
        state: 'book with ID 7 does not exist',
        uponReceiving: 'get book with ID 7',
        withRequest: {
          method: 'GET',
          path: '/books/7',
        },
        willRespondWith: {
          status: 404,
          body: {
            "error": "No book with id 7"
          }
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      await expect(api.getSingleBook(7)).rejects.toThrow("Request failed with status code 404");
    });

  });

  describe("generate token", () => {
    test("token generated", async () => {
      const name = `Client`
      const email = `testuser+${Math.floor(Math.random() * (100000 - 1)) + 1}@gmail.com`

      // set up Pact interactions
      await provider.addInteraction({
        state: 'token generated',
        uponReceiving: 'generate token',
        withRequest: {
          method: 'POST',
          path: '/api-clients',
          body: {
            "clientName": name,
            "clientEmail": email
          },
          headers: {
            'Content-Type': 'application/json'
          }
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            "accessToken": like("d850a25d98612ef9027ddcae8ca77f57abac32fdc1683d234454e99c9584c70a")
          }
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const response = await api.registerAPIClient(name, email);
      expect(response).toEqual({
        "accessToken": like("d850a25d98612ef9027ddcae8ca77f57abac32fdc1683d234454e99c9584c70a").contents
      });

      token = response.accessToken

    });
  })

  describe("place an order", () => {
    test("order placed", async () => {
      const name = `Client`
      const id = 3
      // set up Pact interactions
      await provider.addInteraction({
        state: 'order placed',
        uponReceiving: 'place an order',
        withRequest: {
          method: 'POST',
          path: '/orders',
          body: {
            "bookId": id,
            "customerName": name
          },
          headers: {
            'Content-Type': 'application/json',
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            "created": true,
            "orderId": like(orderID)
          }
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const response = await api.placeAnOrder(id, name, token);
      expect(response).toEqual({
        "created": true,
        "orderId": like(orderID).contents
      });

    });

    test("book unavailable", async () => {
      const name = `Client`
      const id = 2
      // set up Pact interactions
      await provider.addInteraction({
        state: 'book unavailable',
        uponReceiving: 'place an order',
        withRequest: {
          method: 'POST',
          path: '/orders',
          body: {
            "bookId": id,
            "customerName": name
          },
          headers: {
            'Content-Type': 'application/json',
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            "error": "This book is not in stock. Try again later."
          }
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      await expect(api.placeAnOrder(id, name, token)).rejects.toThrow("Request failed with status code 404");

    });
  })

  describe("getting order by id", () => {
    test("order with ID exists", async () => {
      const body =  {
        "id": like(orderID),
        "bookId": like(1),
        "customerName": like("Darnell Upton"),
        "createdBy": like("a484b29c4d2accbbd27733305984cd7ce1af295569c3c615339e93fa3f882ec5"),
        "quantity": 1,
        "timestamp": like(1657212838548)
      }
      // set up Pact interactions
      await provider.addInteraction({
        state: "order with ID exists",
        uponReceiving: "get order using ID",
        withRequest: {
          method: 'GET',
          path: `/orders/${orderID}`,
          headers: {
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: body,
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const order = await api.getSingleOrder(orderID, token);

      expect(order.createdBy).toEqual(body.createdBy.contents);
    });

    test("book does not exist", async () => {
      const incorrectID = "hdxbc2Ut65wQTutsha6w"
      // set up Pact interactions
      await provider.addInteraction({
        state: `order with ID ${incorrectID} does not exist`,
        uponReceiving: `get book with ID ${incorrectID}`,
        withRequest: {
          method: 'GET',
          path: `/orders/${incorrectID}`,
          headers: {
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 404,
          body: {
            "error": `No order with id ${incorrectID}.`
          }
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      await expect(api.getSingleOrder(incorrectID, token)).rejects.toThrow("Request failed with status code 404");
    });

  });

  describe("update an order", () => {
    test("order updated", async () => {
      const newName = `Client Updated`
      // set up Pact interactions
      await provider.addInteraction({
        state: 'order updated',
        uponReceiving: 'update an order',
        withRequest: {
          method: 'PATCH',
          path: `/orders/${orderID}`,
          body: {
            "customerName": newName
          },
          headers: {
            'Content-Type': 'application/json',
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 204,
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const response = await api.updateAnOrder(orderID, newName, token);
      expect(response).toEqual(204);

    });

    test("updates are saved", async () => {
      const body =  {
        "id": like(orderID),
        "bookId": like(1),
        "customerName": like("Client Updated"),
        "createdBy": like("a484b29c4d2accbbd27733305984cd7ce1af295569c3c615339e93fa3f882ec5"),
        "quantity": 1,
        "timestamp": like(1657212838548)
      }
      // set up Pact interactions
      await provider.addInteraction({
        state: "updates into order applied",
        uponReceiving: `get order with ID ${orderID}`,
        withRequest: {
          method: 'GET',
          path: `/orders/${orderID}`,
          headers: {
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: body,
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const order = await api.getSingleOrder(orderID, token);

      expect(order.customerName).toEqual(body.customerName.contents);
    });

  })

  describe("delete an order", () => {
    test("order deleted", async () => {
      // set up Pact interactions
      await provider.addInteraction({
        state: 'order deleted',
        uponReceiving: 'delete an order',
        withRequest: {
          method: 'DELETE',
          path: `/orders/${orderID}`,
          headers: {
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 204,
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      const response = await api.deleteAnOrder(orderID, token);
      expect(response).toEqual(204);

    });

    test("deleted order exists no more", async () => {
      // set up Pact interactions
      await provider.addInteraction({
        state: "deleted order exists no more",
        uponReceiving: `get order with ID ${orderID}`,
        withRequest: {
          method: 'GET',
          path: `/orders/${orderID}`,
          headers: {
            "Authorization": token
          }
        },
        willRespondWith: {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            "error": `No order with id ${orderID}.`
          },
        },
      });

      const api = new API(provider.mockService.baseUrl);

      // make request to Pact mock server
      await expect(api.getSingleOrder(orderID, token)).rejects.toThrow("Request failed with status code 404");
    });


  })

});

