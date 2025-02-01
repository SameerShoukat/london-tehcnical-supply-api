const axios = require('axios');

const BASE_URL = "https://api.company-information.service.gov.uk";

class CompaniesHouseTimeFilter {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getCompaniesByIncorporationDate({
    year,
    fromYear,
    toYear,
    month,
    fromMonth,
    toMonth,
    itemsPerpagination = 100
  } = {}) {
    // Use let instead of const to allow reassignment
    let incorporationFrom = this.constructDateFilter(fromYear, fromMonth);
    let incorporationTo = this.constructDateFilter(toYear, toMonth, true);
  
    // If a specific year is provided, create date range for that year
    if (year) {
      incorporationFrom = `${year}-01-01`;
      incorporationTo = `${year}-12-31`;
    }
  
    try {
      const response = await axios.get(`${BASE_URL}/search/companies`, {
        params: {
          incorporation_from: incorporationFrom,
          incorporation_to: incorporationTo,
          items_per_page: Math.min(itemsPerPage, 100)
        },
        auth: {
          username: this.apiKey,
          password: ''
        }
      });
  
      // Extract and return company details
      return response.data.items.map(company => ({
        companyNumber: company.company_number,
        companyName: company.title,
        companyStatus: company.company_status,
        incorporationDate: company.date_of_creation
      }));
    } catch (error) {
      console.error("Error fetching companies:", error.response?.data || error.message);
      throw error;
    }
  }
  

  constructDateFilter(year, month, isEndDate = false) {
    if (!year) return undefined;

    if (month) {
      const day = isEndDate ? new Date(year, month, 0).getDate() : '01';
      return `${year}-${month.padStart(2, '0')}-${day}`;
    }

    return isEndDate ? `${year}-12-31` : `${year}-01-01`;
  }
}

// Example usage
async function main() {
  const apiKey = "c1e9e0d0-b26b-4523-a4d0-e8dbb66986f1";
  const companiesSearch = new CompaniesHouseTimeFilter(apiKey);

  try {
    const companiesIn2022 = await companiesSearch.getCompaniesByIncorporationDate({
      year: "2024",
    });
    console.log("Companies Incorporated in 2024:", companiesIn2022);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
