import express from "express";
import { WebSocketServer } from "ws";
import WebSocket from "ws";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("X-Quo WS Proxy attivo 🚀");
});

const server = app.listen(port, () => {
  console.log("Proxy in ascolto su porta", port);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (client, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  const target = `wss://api.x-quo.xyz${url.pathname}`;

  console.log("Proxying WS ->", target, "token:", token ? "yes" : "no");

  const upstream = new WebSocket(target, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  client.on("message", (msg) => upstream.send(msg));
  upstream.on("message", (msg) => client.send(msg));

  client.on("close", () => upstream.close());
  upstream.on("close", () => client.close());
});
