import axios from "axios";
import dotenv from "dotenv";
import readline from "readline";
dotenv.config();
const hubspotApiKey = process.env.HUBSPOT_API_KEY;
const twentyApiKey = process.env.TWENTY_API_KEY;
async function fetchHubSpotCompanies(after = null) {
  try {
    let url =
      "https://api.hubapi.com/crm/v3/objects/companies?limit=100&properties=domain,phone,name,city,website";
    if (after) {
      url += `&after=${after}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${hubspotApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const companies = response.data.results;
    const nextPage = response.data.paging?.next?.after || null;
    return { companies, nextPage };
  } catch (error) {
    console.log(error);
  }
}

function mapCompanyDataToTwentyFormat(hubspotCompanies) {
  return hubspotCompanies.map((company) => {
    return {
      name: company.properties.name || "No Name",
      domainName: {
        primaryLinkLabel: "",
        primaryLinkUrl: company.properties.domain || "",
        secondaryLinks: [],
      },
      employees: company.properties.employees || 0,
      linkedinLink: {
        primaryLinkLabel: "LinkedIn",
        primaryLinkUrl: "",
        secondaryLinks: [],
      },
      xLink: {
        primaryLinkLabel: "X Link",
        primaryLinkUrl: "",
        secondaryLinks: [],
      },
      annualRecurringRevenue: {
        amountMicros: company.properties.annualrevenue * 1000000 || 0,
        currencyCode: "USD",
      },
      address: {
        addressStreet1: company.properties.address || "",
        addressCity: company.properties.city || "",
        addressState: company.properties.state || "",
        addressCountry: company.properties.country || "",
      },
      idealCustomerProfile: false,
      createdBy: { source: "EMAIL" },
      accountOwnerId: null,
    };
  });
}

async function sendToTwentyCRM(mappedData, checkDuplicates) {
  const uniqueCompanies = [];

  if (checkDuplicates) {
    for (const company of mappedData) {
      const existingCompany = await checkCompanyInTwenty(
        company.domainName.primaryLinkUrl
      );
      if (existingCompany) {
        console.log(`Company ${company.name} already exists. Skipping.`);
        continue;
      }
      uniqueCompanies.push(company);
    }
  } else {
    console.log("Skipping duplicate check, migrating all companies.");
    uniqueCompanies.push(...mappedData);
  }

  const options = {
    method: "POST",
    url: "https://api.twenty.com/rest/batch/companies",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${twentyApiKey}`,
    },
    data: uniqueCompanies,
  };

  try {
    const { data } = await axios.request(options);
    console.log("Companies migrated successfully:", data);
  } catch (error) {
    console.error("Error migrating companies:", error.message);
  }
}

async function syncAllCompanies() {
  let after = null;
  let allCompanies = [];
  do {
    const { companies, nextPage } = await fetchHubSpotCompanies(after);
    if (companies) {
      allCompanies = allCompanies.concat(companies);
      console.log(allCompanies);
    }
    after = nextPage;

    await new Promise((resolve) => setTimeout(resolve, 5000));
  } while (after);
  return allCompanies;
}

async function checkCompanyInTwenty(domain) {
  const options = {
    method: "GET",
    url: "https://api.twenty.com/rest/companies",
    params: {
      filter: `domainName.primaryLinkUrl[eq]:${domain}`,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${twentyApiKey}`,
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data.totalCount > 0) {
      return response.data;
    }
  } catch (error) {
    return null;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Do you want to check for duplicates before migrating? (yes/no): ",
  (answer) => {
    const checkDuplicates = answer.toLowerCase() === "yes";
    rl.question("Do you want to start the script (yes/no): ", (startAnswer) => {
      if (startAnswer.toLowerCase() === "yes") {
        syncAllCompanies().then((allHubSpotCompanies) => {
          const mappedCompanies =
            mapCompanyDataToTwentyFormat(allHubSpotCompanies);
          sendToTwentyCRM(mappedCompanies, checkDuplicates);
        });
      } else {
        console.log("Script not started.");
      }
      rl.close();
    });
  }
);
