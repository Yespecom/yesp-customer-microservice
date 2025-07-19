const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors") // Import the cors package

dotenv.config() // Load environment variables from .env (or Vercel config)

const customerRoutes = require("./routes/customerRoutes")
const { connectMainDB } = require("./config/db") // Import connectMainDB

const app = express()

app.use(cors()) // Use cors middleware to enable CORS for all routes
app.use(express.json()) // For parsing application/json request bodies

// Connect to the main database when the server starts
connectMainDB()

// Use the customer routes
app.use("/api/customers", customerRoutes)

// Basic root route
app.get("/", (req, res) => {
  res.send("YESP Customer Microservice Running 🚀")
})

const PORT = process.env.PORT || 5006
app.listen(PORT, () => {
  console.log(`✅ YESP Customer Microservice running on port ${PORT}`)
})
