#!bin/bash

echo "Cleaning build directory..."
rm -rf build
# create build if not exists
echo "Creating build folder..."
mkdir -p build
echo "copying artifact to build folder..."
cp -r WarehouseManagementBackend/dist WarehouseManagementBackend/.env.development WarehouseManagementBackend/.env.production WarehouseManagementBackend/prisma WarehouseManagementBackend/barcodes WarehouseManagementBackend/locations WarehouseManagementBackend/uploads WarehouseManagementBackend/package.json WarehouseManagementBackend/package-lock.json WarehouseManagementUI/build build/
echo "Artifact folder created successfully."