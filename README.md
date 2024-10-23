## HubSpot to Twenty CRM Company/Account Migration Script
This Node.js script allows you to migrate company or account data from HubSpot CRM to Twenty CRM. It fetches data from HubSpot using its API, maps it into the required format, and posts it to Twenty CRM in batch. This can help you seamlessly transfer company data while ensuring the necessary fields are properly mapped.

## Features
- Fetches companies from HubSpot CRM: Retrieves companies and associated details such as name, domain, employees, revenue, and more.
- Maps HubSpot data to Twenty CRM: Converts the company data into the format required by Twenty CRM.
- Batch migration: Sends companies in batches to Twenty CRM.
- Duplicate check (Optional): You can enable or disable duplicate checking during the migration process.
## Prerequisites
- Node.js: Make sure you have Node.js installed on your machine.
- API Keys: You will need API keys from both HubSpot CRM and Twenty CRM.
## Setup
- Clone the repository:

```bash
Copy code
git clone https://github.com/your-repo/hubspot-to-twenty-crm-migration.git
cd hubspot-to-twenty-crm-migration
```

## Install dependencies:

```bash
Copy code
npm install
```
## Create a .env file:

In the project root, create a .env file with the following:

```bash
Copy code
HUBSPOT_API_KEY=your_hubspot_api_key
TWENTY_API_KEY=your_twenty_api_key
```

## Usage
- Run the script:

## To start the migration process, run:

```bash
Copy code
node migrate-companies.js
```
- Choose duplicate checking:

You will be prompted with the following:

```bash
Copy code
Do you want to check for duplicates before migrating? (yes/no):
If you select yes, the script will check Twenty CRM for duplicate company names and skip them during migration.
If you select no, the script will migrate all companies without duplicate checks.
Start the migration:

After confirming, the script will begin fetching companies from HubSpot and transferring them to Twenty CRM.
```

## Code Overview
- fetchHubSpotCompanies(): Fetches companies from HubSpot CRM.
- mapDataToTwentyFormat(): Maps the company data from HubSpot's format to the format expected by Twenty CRM.
- sendToTwentyCRM(): Sends the mapped data to Twenty CRM in batch.
- checkDuplicateInTwenty(): (Optional) Checks for duplicate companies in Twenty CRM before migration.
