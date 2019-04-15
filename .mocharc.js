module.exports = {
  diff: true,
  package: './package.json',
  r: 'ts-node/register',
  spec: "test/*.spec.ts",
  slow: 75,
  timeout: 2000,
  ui: 'bdd'
};