# ChatWithDAB
Using Data API Builder in Single Page Chat App

## Prepare Cosmos DB

1. Create a Cosmos  DB NoSqL Account
2. Create a  DB called "CosmosChat"
3. Create a container called "Chats"
4. Create a container called "Messages"

# Deploy  Data API Builder

1. Follow the steps  provided at  https://github.com/Azure/data-api-builder/blob/main/docs/getting-started/getting-started.md#installing-dab-cli to deploy DAB on your local  machine.
2. Get the Cosmos DB account Details as described in https://github.com/Azure/data-api-builder/blob/main/docs/getting-started/getting-started-azure-cosmos-db.md#get-the-cosmos-db-account-connection-string and update dab-config.json
3. Start the Data API Builder as described in https://github.com/Azure/data-api-builder/blob/main/docs/getting-started/getting-started-azure-cosmos-db.md#start-data-api-builder-for-azure-cosmos-db

## Configure Application
1. Copy the ChatApp folder to a WebServer
2. Update the API URL at Line# 5 in ChatApp\js\site.js (optional)
3. Open index.html from the ChatApp folder in a Browser