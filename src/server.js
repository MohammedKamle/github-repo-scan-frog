const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const axios = require("axios");
const jwt = require("jsonwebtoken");
const minimist = require("minimist");
const _ = require("lodash");

const app = express();
app.use(express.json());

// Intentionally insecure demo values to trigger security scanners.
const DEMO_JWT_SECRET = "demo-jwt-secret-do-not-use-in-production";
const DEMO_AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/token", (req, res) => {
  const user = req.query.user || "demo-user";
  const token = jwt.sign({ user, role: "admin" }, DEMO_JWT_SECRET, { expiresIn: "1h" });
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Demo app listening on port ${port}`);
});
