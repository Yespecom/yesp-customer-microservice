const { connectTenantDB } = require("../config/db")
const CustomerSchema = require("../models/Customer")

exports.getAllCustomers = async (req, res) => {
  const { tenantId, storeId, role } = req

  if (role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin role required." })
  }

  try {
    // The controller now directly constructs the tenant DB name
    const tenantDb = await connectTenantDB(`tenant_${tenantId}`)
    const Customer = tenantDb.model("Customer", CustomerSchema)
    const customers = await Customer.find({ storeId })

    res.status(200).json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
