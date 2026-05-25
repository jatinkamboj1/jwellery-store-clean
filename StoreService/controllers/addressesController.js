const prisma = require("../prismaClient");
const { connect } = require("../routes/address");

const buildFilterQuery = (filters) => {
  const query = {};
  for (const key in filters) {
    if (filters[key]) {
      query[key] = { contains: filters[key], mode: "insensitive" };
    }
  }
  return query;
};

const addUserAddress = async (req, res) => {
  try {
   console.log("eiwiwj");
   
    
    const { id } = req.params;
    let userId = id;
    if (id === "user") {
      userId = req.user.id;
    }
    const data = req.body;
    const addressCount = await prisma.addresses.count({
      where: { userId: userId },
    });
    if (addressCount >= 5) {
      return res.status(400).json({
        message: "You can only add up to 5 addresses.",
      });
    }
    const address = await prisma.addresses.create({
      data: { ...data, user: { connect: { id: userId } } },
    });

    return res
      .status(201)
      .json({ message: "Successfully added an address", address });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getAddressByUserId = async (req, res) => {
  const { id } = req.params;
  let userId = id;
  if (id === "user") {
    userId = req.user.id;
  }
  try {
    const address = await prisma.addresses.findMany({
      where: { userId: userId },
    });
    if (!address) return res.status(404).json({ message: "No address found." });
    return res.status(200).json(address);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getAddressBytoken = async (req, res) => {
  const { id } = req.user; // Extract user ID from token
  try {
    const addresses = await prisma.Addresses.findMany({
      where: { userId: id },
      include: { user: true },
    });

    if (!addresses.length) {
      return res.status(404).json({ message: "No address found." });
    }

    return res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getAddressType = async (req, res) => {
  const { id } = req.user; // Extract user ID from token
  try {
    const addresses = await prisma.Addresses.findMany({
      where: { userId: id },
      select: {
        id: true,
        street: true,
        name: true,
        city: true,
        stateOrProvince: true,
        country: true,
        zip: true,
        addressType: true,
        isDefault: true,
      },
    });

    if (!addresses.length) {
      return res.status(404).json({ message: "No address found." });
    }

    return res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// const getAddressType = async (req, res) => {
//   const { id } = req.user; // Extract user ID from token
//   try {
//     // Fetch all addresses for the user
//     const addresses = await prisma.addresses.findMany({
//       where: { userId: id },
//       select: {
//         street: true,
//         name: true,
//         city: true,
//         stateOrProvince: true,
//         country: true,
//         zip: true,
//         addressType: true,
//         isDefault: true,
//       },
//     });

//     // Initialize the response structure with empty arrays for SHIPPING and BILLING
//     const result = {
//       "SHIPPING": [],
//       "BILLING": []
//     };

//     // If addresses exist, group them by addressType
//     if (addresses.length > 0) {
//       const groupedAddresses = addresses.reduce((acc, address) => {
//         if (!acc[address.addressType]) {
//           acc[address.addressType] = []; // Initialize the array for this addressType
//         }
//         acc[address.addressType].push(address);
//         return acc;
//       }, {});

//       // Update the result object with the grouped addresses
//       Object.keys(groupedAddresses).forEach(addressType => {
//         result[addressType] = groupedAddresses[addressType];
//       });
//     }

//     // Return the final result with grouped addresses or empty arrays
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching addresses:", error);
//     return res.status(500).json({ message: "Internal Server Error." });
//   }
// };

const updateAddress = async (req, res) => {
  const id = req.params.id;
  try {
    const address = await prisma.addresses.findUnique({ where: { id } });
    if (!address) return res.status(404).json({ message: "No address found" });
    const {
      street,
      city,
      stateOrProvince,
      country,
      zip,
      addressType,
      isDefault,
    } = req.body;
    const updatedAddress = await prisma.addresses.update({
      where: { id },
      data: {
        street: street || address.street,
        city: city || address.city,
        stateOrProvince: stateOrProvince || address.stateOrProvince,
        country: country || address.country,
        zip: zip || address.zip,
        addressType: addressType || address.addressType,
        isDefault: isDefault,
      },
    });
    return res.status(200).json({
      message: "Successfully updated address",
      updatedAddress,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const updateAddressbyToken = async (req, res) => {
  const { id } = req.params;
  try {
    const address = await prisma.addresses.findUnique({ where: { id } });
    if (!address) return res.status(404).json({ message: "No address found" });
    const {
      street,
      city,
      stateOrProvince,
      country,
      zip,
      addressType,
      isDefault,
    } = req.body;
    const updatedAddress = await prisma.addresses.update({
      where: { id },
      data: {
        street: street || address.street,
        city: city || address.city,
        stateOrProvince: stateOrProvince || address.stateOrProvince,
        country: country || address.country,
        zip: zip || address.zip,
        addressType: addressType || address.addressType,
        isDefault: isDefault,
      },
    });
    return res.status(200).json({
      message: "Successfully updated address",
      updatedAddress,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
const deleteAddress = async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.addresses.delete({ where: { id } });
    return res.status(200).json({ message: "Successfully deleted address" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  getAddressType,
  addUserAddress,
  getAddressByUserId,
  updateAddress,
  updateAddressbyToken,
  getAddressBytoken,
  deleteAddress,
};
