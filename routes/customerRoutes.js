const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const { connectMainDB, connectTenantDB } = require("../config/db")
const Tenant = require("../models/Tenant")
const CustomerSchema = require("../models/Customer")
const { getAllCustomers } = require("../controllers/customerController")

const router = express.Router()

const getTenantDbName = async (tenantId) => {
  await connectMainDB() // Ensure main DB is connected before querying Tenant model
  const tenant = await Tenant.findOne({ tenantId })
  if (!tenant || !tenant.dbName) throw new Error("Tenant not found or dbName not configured")
  return tenant.dbName
}

// Helper function to generate a unique 6-digit customerId
const generateUniqueCustomerId = async (CustomerModel) => {
  let isUnique = false
  let newCustomerId
  while (!isUnique) {
    // Generate a random 6-digit number (between 100000 and 999999)
    newCustomerId = Math.floor(100000 + Math.random() * 900000).toString()
    const existingCustomer = await CustomerModel.findOne({ customerId: newCustomerId })
    if (!existingCustomer) {
      isUnique = true
    }
  }
  return newCustomerId
}

// ➕ Add Customer
router.post("/", authMiddleware, async (req, res) => {
  const { tenantId, storeId } = req
  try {
    const dbName = await getTenantDbName(tenantId)
    const tenantDb = await connectTenantDB(dbName)
    const Customer = tenantDb.model("Customer", CustomerSchema) // Use the schema directly

    // Generate a unique 6-digit customerId
    const generatedCustomerId = await generateUniqueCustomerId(Customer)

    // Combine generated ID with request body and storeId/tenantId from token
    const customerData = {
      ...req.body,
      customerId: generatedCustomerId,
      tenantId: tenantId, // Ensure tenantId from token is used
      storeId: storeId, // Ensure storeId from token is used
    }

    const customer = new Customer(customerData)
    await customer.save()
    res.status(201).json({ message: "Customer added", customer })
  } catch (err) {
    console.error("Error adding customer:", err.message)
    res.status(500).json({ message: "Error creating customer", error: err.message })
  }
})

// 📄 Get All Customers
router.get("/", authMiddleware, getAllCustomers)

// 📄 Get Customer by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { tenantId, storeId } = req
  const customerId = req.params.id // This is the MongoDB _id, not the new 6-digit customerId
  try {
    const dbName = await getTenantDbName(tenantId)
    const tenantDb = await connectTenantDB(dbName)
    const Customer = tenantDb.model("Customer", CustomerSchema)
    const customer = await Customer.findOne({ _id: customerId, storeId })
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json(customer)
  } catch (err) {
    console.error("Error fetching customer by ID:", err.message)
    res.status(500).json({ message: "Error fetching customer", error: err.message })
  }
})

// ✏️ Update Customer
router.put("/:id", authMiddleware, async (req, res) => {
  const { tenantId, storeId } = req
  const customerId = req.params.id // This is the MongoDB _id
  try {
    const dbName = await getTenantDbName(tenantId)
    const tenantDb = await connectTenantDB(dbName)
    const Customer = tenantDb.model("Customer", CustomerSchema)
    // Prevent updating the auto-generated customerId or tenantId/storeId via PUT
    const updateData = { ...req.body }
    delete updateData.customerId
    delete updateData.tenantId
    delete updateData.storeId

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: customerId, storeId },
      updateData,
      { new: true, runValidators: true }, // Return the updated document and run schema validators
    )
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json({ message: "Customer updated", customer: updatedCustomer })
  } catch (err) {
    console.error("Error updating customer:", err.message)
    res.status(500).json({ message: "Error updating customer", error: err.message })
  }
})

module.exports = router
