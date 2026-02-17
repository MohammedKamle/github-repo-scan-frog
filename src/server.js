const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const axios = require("axios");
const handlebars = require("handlebars");
const yaml = require("js-yaml");
const minimist = require("minimist");
const forge = require("node-forge");
const { DOMParser } = require("xmldom");
const serialize = require("serialize-javascript");
const _ = require("lodash");

const app = express();
app.use(express.json());

// Intentionally insecure demo values to trigger security scanners.w
const DEMO_AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/token", (req, res) => {
  const user = req.query.user || "demo-user";
  const payload = Buffer.from(
    JSON.stringify({ user, role: "admin", iat: Date.now() / 1000 })
  ).toString("base64url");
  const token = `demo.${payload}.unsigned`;
  res.json({ token, leakedKey: DEMO_AWS_ACCESS_KEY_ID });
});

app.get("/run", (req, res) => {
  const command = req.query.cmd || "whoami";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    return res.json({ command, stdout, stderr });
  });
});

app.post("/eval", (req, res) => {
  const expression = req.body.expression || "'hello-demo'";
  const result = eval(expression); // intentionally unsafe for SAST demo
  res.json({ result });
});

app.get("/read-file", (req, res) => {
  const requested = req.query.file || "README.md";
  const filePath = path.join(__dirname, "..", requested);
  fs.readFile(filePath, "utf8", (err, content) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ file: requested, content });
  });
});

app.get("/proxy", async (req, res) => {
  const url = req.query.url || "https://example.com";
  try {
    const response = await axios.get(url, { timeout: 4000 });
    return res.json({ proxiedUrl: url, status: response.status });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/parse-args", (req, res) => {
  const args = String(req.query.args || "--name demo --debug true");
  const parsed = minimist(args.split(" "));
  res.json({ parsed });
});

app.post("/merge", (req, res) => {
  const merged = _.merge({}, req.body);
  res.json({ merged });
});

app.post("/template", (req, res) => {
  const template = String(req.body.template || "Hello {{name}}");
  const compiled = handlebars.compile(template);
  const html = compiled({ name: req.body.name || "demo-user" });
  res.json({ html });
});

app.post("/yaml", (req, res) => {
  const payload = String(req.body.payload || "name: demo\nrole: user");
  const parsed = yaml.load(payload);
  res.json({ parsed });
});

app.post("/xml", (req, res) => {
  const xml = String(req.body.xml || "<user><name>demo</name></user>");
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const root = doc.documentElement ? doc.documentElement.nodeName : "unknown";
  res.json({ root });
});

app.get("/serialize", (req, res) => {
  const source = {
    user: req.query.user || "demo",
    role: req.query.role || "viewer"
  };
  const serialized = serialize(source);
  res.json({ serialized });
});

app.get("/hash", (req, res) => {
  const input = String(req.query.input || "demo-data");
  const md = forge.md.md5.create();
  md.update(input, "utf8");
  res.json({ md5: md.digest().toHex() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Demo app listening on port ${port}`);
});
