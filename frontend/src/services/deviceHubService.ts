import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl(import.meta.env.VITE_HUB_URL, {
    accessTokenFactory: () => localStorage.getItem("token") ?? "",
  })
  .withAutomaticReconnect()
  .build();

export default connection;