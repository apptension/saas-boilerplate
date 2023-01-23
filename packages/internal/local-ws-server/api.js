import axios from "axios";

const BE_ENDPOINT_URL = process.env.BE_ENDPOINT_URL;

export class Api {
  static #connectEndpoint() {
    return `${BE_ENDPOINT_URL}debug/ws/connect/`;
  }

  static #disconnectEndpoint(connectionId) {
    return `${BE_ENDPOINT_URL}debug/ws/disconnect/${connectionId}/`;
  }

  static #messageEndpoint(connectionId) {
    return `${BE_ENDPOINT_URL}debug/ws/message/${connectionId}/`;
  }

  static connect(userId, connectionId) {
    return axios.post(this.#connectEndpoint(), {
      user_pk: userId,
      connection_id: connectionId,
    });
  }

  static disconnect(connectionId) {
    return axios.delete(this.#disconnectEndpoint(connectionId));
  }

  static message(connectionId, payload) {
    return axios.post(this.#messageEndpoint(connectionId), JSON.parse(payload));
  }
}
