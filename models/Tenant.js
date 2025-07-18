const mongoose = require("mongoose")

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  dbName: { type: String, required: true, unique: true },
  // You can add other tenant-specific fields here if needed
})

// Export as a model directly, as it will be used with the main DB connection
module.exports = mongoose.model("Tenant", tenantSchema)
