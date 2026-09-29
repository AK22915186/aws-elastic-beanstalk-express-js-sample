const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server only when app.js is executed directly.
// Tests can import the Express app without automatically opening a port.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
  });
}

// Export the Express app for automated testing.
module.exports = app;
