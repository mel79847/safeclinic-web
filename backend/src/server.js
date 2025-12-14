const env = require("./config/env");
const app = require("./app");

app.listen(env.PORT, () => {
  console.log(`✅ SafeClinic API escuchando en ${env.PORT}`);
});
