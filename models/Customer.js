const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema(
  {
    customerId: { type: String, unique: true, required: true }, // New: unique and required
    tenantId: { type: String, required: true }, // New: required
    storeId: { type: String, required: true }, // New: required
    name: String,
    email: String, // No longer unique
    phone: String,
    address: String, // Changed to single string
    city: String,
    state: String,
    zipCode: String,
    country: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
) // Keep timestamps if desired, though not explicitly in new schema, it's good practice

module.exports = customerSchema
