import axios from "axios";
import adapter from "axios/lib/adapters/http";

axios.defaults.adapter = adapter;

export class API {

    constructor(url) {
        if (url === undefined || url === "") {
            url = process.env.BASE_URL;
        }
        this.url = url
    }

    withPath(path) {
        return `${this.url}${path}`
    }

    async requestStatus() {
        return axios.get(this.withPath("/status"), {
        })
            .then(r => r.data);
    }

    async getAllBooks() {
        return axios.get(this.withPath("/books"), {
        })
            .then(r => r.data);
    }

    async getSingleBook(id) {
        return axios.get(this.withPath("/books/" + id), {
        })
            .then(r => r.data);
    }

    async registerAPIClient(name, email) {
        return axios.post(this.withPath("/api-clients"), {
            "clientName": name,
            "clientEmail": email
        }, {headers: {
                'Content-Type': 'application/json'
            }})
            .then(r => {
                return r.data
            });
    }

    async placeAnOrder(bookId, name, token) {
        return axios.post(this.withPath("/orders"), {
            "bookId": bookId,
            "customerName": name
        }, {headers: {
                'Content-Type': 'application/json',
                "Authorization": token
            }
        })
            .then(r => {
                return r.data
            });
    }

    async getSingleOrder(id, token) {
        return axios.get(this.withPath("/orders/" + id), {
            headers: {
                "Authorization": token
            }
        })
            .then(r => r.data);
    }

    async updateAnOrder(id, name, token) {
        return axios.patch(this.withPath(`/orders/${id}`), {
            "customerName": name
        }, { headers: {
                'Content-Type': 'application/json',
                "Authorization": token
            }
        })
            .then(r => r.status);
    }

    async deleteAnOrder(id, token) {
        return axios.delete(this.withPath(`/orders/${id}`), {headers: {
                "Authorization": token
            }
        })
            .then(r => r.status);
    }
}


export default new API(process.env.BASE_URL);