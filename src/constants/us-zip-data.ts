/**
 * US ZIP Code Data
 *
 * One representative ZIP per major US city (matches the US_CITIES list
 * in service-areas.ts). Used for instant local suggestions when the
 * user types in a ZIP, city, or state in the booking form.
 */

export interface USZipEntry {
  zip: string
  city: string
  stateCode: string
}

export const US_ZIP_DATA: USZipEntry[] = [
  // Alabama
  { zip: "36104", city: "Montgomery", stateCode: "AL" },
  { zip: "36602", city: "Mobile", stateCode: "AL" },
  { zip: "35801", city: "Huntsville", stateCode: "AL" },
  // Alaska
  { zip: "99501", city: "Anchorage", stateCode: "AK" },
  { zip: "99701", city: "Fairbanks", stateCode: "AK" },
  { zip: "99801", city: "Juneau", stateCode: "AK" },
  // Arizona
  { zip: "85008", city: "Phoenix", stateCode: "AZ" },
  { zip: "85701", city: "Tucson", stateCode: "AZ" },
  { zip: "85201", city: "Mesa", stateCode: "AZ" },
  { zip: "85225", city: "Chandler", stateCode: "AZ" },
  // Arkansas
  { zip: "72201", city: "Little Rock", stateCode: "AR" },
  { zip: "72901", city: "Fort Smith", stateCode: "AR" },
  { zip: "72701", city: "Fayetteville", stateCode: "AR" },
  // California
  { zip: "90001", city: "Los Angeles", stateCode: "CA" },
  { zip: "92101", city: "San Diego", stateCode: "CA" },
  { zip: "95101", city: "San Jose", stateCode: "CA" },
  { zip: "94102", city: "San Francisco", stateCode: "CA" },
  { zip: "93701", city: "Fresno", stateCode: "CA" },
  { zip: "95814", city: "Sacramento", stateCode: "CA" },
  { zip: "90802", city: "Long Beach", stateCode: "CA" },
  { zip: "94601", city: "Oakland", stateCode: "CA" },
  { zip: "93301", city: "Bakersfield", stateCode: "CA" },
  { zip: "92801", city: "Anaheim", stateCode: "CA" },
  // Colorado
  { zip: "80202", city: "Denver", stateCode: "CO" },
  { zip: "80903", city: "Colorado Springs", stateCode: "CO" },
  { zip: "80010", city: "Aurora", stateCode: "CO" },
  // Connecticut
  { zip: "06103", city: "Hartford", stateCode: "CT" },
  { zip: "06510", city: "New Haven", stateCode: "CT" },
  { zip: "06901", city: "Stamford", stateCode: "CT" },
  // Delaware
  { zip: "19801", city: "Wilmington", stateCode: "DE" },
  { zip: "19901", city: "Dover", stateCode: "DE" },
  // Florida
  { zip: "32099", city: "Jacksonville", stateCode: "FL" },
  { zip: "33101", city: "Miami", stateCode: "FL" },
  { zip: "33601", city: "Tampa", stateCode: "FL" },
  { zip: "32801", city: "Orlando", stateCode: "FL" },
  { zip: "33701", city: "St. Petersburg", stateCode: "FL" },
  // Georgia
  { zip: "30301", city: "Atlanta", stateCode: "GA" },
  { zip: "30901", city: "Augusta", stateCode: "GA" },
  { zip: "31901", city: "Columbus", stateCode: "GA" },
  { zip: "31401", city: "Savannah", stateCode: "GA" },
  // Hawaii
  { zip: "96801", city: "Honolulu", stateCode: "HI" },
  // Idaho
  { zip: "83702", city: "Boise", stateCode: "ID" },
  // Illinois
  { zip: "60601", city: "Chicago", stateCode: "IL" },
  { zip: "60502", city: "Aurora", stateCode: "IL" },
  { zip: "60540", city: "Naperville", stateCode: "IL" },
  // Indiana
  { zip: "46201", city: "Indianapolis", stateCode: "IN" },
  { zip: "46801", city: "Fort Wayne", stateCode: "IN" },
  // Iowa
  { zip: "50309", city: "Des Moines", stateCode: "IA" },
  { zip: "52401", city: "Cedar Rapids", stateCode: "IA" },
  // Kansas
  { zip: "67202", city: "Wichita", stateCode: "KS" },
  { zip: "66204", city: "Overland Park", stateCode: "KS" },
  // Kentucky
  { zip: "40203", city: "Louisville", stateCode: "KY" },
  { zip: "40507", city: "Lexington", stateCode: "KY" },
  // Louisiana
  { zip: "70112", city: "New Orleans", stateCode: "LA" },
  { zip: "70801", city: "Baton Rouge", stateCode: "LA" },
  // Maine
  { zip: "04101", city: "Portland", stateCode: "ME" },
  // Maryland
  { zip: "21201", city: "Baltimore", stateCode: "MD" },
  // Massachusetts
  { zip: "02101", city: "Boston", stateCode: "MA" },
  { zip: "01601", city: "Worcester", stateCode: "MA" },
  { zip: "01101", city: "Springfield", stateCode: "MA" },
  // Michigan
  { zip: "48201", city: "Detroit", stateCode: "MI" },
  { zip: "49503", city: "Grand Rapids", stateCode: "MI" },
  // Minnesota
  { zip: "55401", city: "Minneapolis", stateCode: "MN" },
  { zip: "55101", city: "St. Paul", stateCode: "MN" },
  // Mississippi
  { zip: "39201", city: "Jackson", stateCode: "MS" },
  // Missouri
  { zip: "64101", city: "Kansas City", stateCode: "MO" },
  { zip: "63101", city: "St. Louis", stateCode: "MO" },
  // Montana
  { zip: "59101", city: "Billings", stateCode: "MT" },
  // Nebraska
  { zip: "68102", city: "Omaha", stateCode: "NE" },
  { zip: "68501", city: "Lincoln", stateCode: "NE" },
  // Nevada
  { zip: "89101", city: "Las Vegas", stateCode: "NV" },
  { zip: "89501", city: "Reno", stateCode: "NV" },
  // New Hampshire
  { zip: "03101", city: "Manchester", stateCode: "NH" },
  // New Jersey
  { zip: "07102", city: "Newark", stateCode: "NJ" },
  { zip: "07302", city: "Jersey City", stateCode: "NJ" },
  // New Mexico
  { zip: "87101", city: "Albuquerque", stateCode: "NM" },
  // New York
  { zip: "10001", city: "New York", stateCode: "NY" },
  { zip: "14201", city: "Buffalo", stateCode: "NY" },
  { zip: "14604", city: "Rochester", stateCode: "NY" },
  // North Carolina
  { zip: "28202", city: "Charlotte", stateCode: "NC" },
  { zip: "27601", city: "Raleigh", stateCode: "NC" },
  // North Dakota
  { zip: "58102", city: "Fargo", stateCode: "ND" },
  // Ohio
  { zip: "43215", city: "Columbus", stateCode: "OH" },
  { zip: "44101", city: "Cleveland", stateCode: "OH" },
  { zip: "45202", city: "Cincinnati", stateCode: "OH" },
  // Oklahoma
  { zip: "73102", city: "Oklahoma City", stateCode: "OK" },
  { zip: "74103", city: "Tulsa", stateCode: "OK" },
  // Oregon
  { zip: "97201", city: "Portland", stateCode: "OR" },
  { zip: "97401", city: "Eugene", stateCode: "OR" },
  // Pennsylvania
  { zip: "19102", city: "Philadelphia", stateCode: "PA" },
  { zip: "15222", city: "Pittsburgh", stateCode: "PA" },
  // Rhode Island
  { zip: "02901", city: "Providence", stateCode: "RI" },
  // South Carolina
  { zip: "29401", city: "Charleston", stateCode: "SC" },
  { zip: "29201", city: "Columbia", stateCode: "SC" },
  // South Dakota
  { zip: "57104", city: "Sioux Falls", stateCode: "SD" },
  // Tennessee
  { zip: "38103", city: "Memphis", stateCode: "TN" },
  { zip: "37201", city: "Nashville", stateCode: "TN" },
  // Texas
  { zip: "77001", city: "Houston", stateCode: "TX" },
  { zip: "78205", city: "San Antonio", stateCode: "TX" },
  { zip: "75201", city: "Dallas", stateCode: "TX" },
  { zip: "78701", city: "Austin", stateCode: "TX" },
  { zip: "76102", city: "Fort Worth", stateCode: "TX" },
  { zip: "79901", city: "El Paso", stateCode: "TX" },
  // Utah
  { zip: "84101", city: "Salt Lake City", stateCode: "UT" },
  // Vermont
  { zip: "05401", city: "Burlington", stateCode: "VT" },
  // Virginia
  { zip: "23451", city: "Virginia Beach", stateCode: "VA" },
  { zip: "23510", city: "Norfolk", stateCode: "VA" },
  { zip: "23219", city: "Richmond", stateCode: "VA" },
  // Washington
  { zip: "98101", city: "Seattle", stateCode: "WA" },
  { zip: "99201", city: "Spokane", stateCode: "WA" },
  { zip: "98401", city: "Tacoma", stateCode: "WA" },
  // Washington DC
  { zip: "20001", city: "Washington", stateCode: "DC" },
  // West Virginia
  { zip: "25301", city: "Charleston", stateCode: "WV" },
  // Wisconsin
  { zip: "53202", city: "Milwaukee", stateCode: "WI" },
  { zip: "53703", city: "Madison", stateCode: "WI" },
  // Wyoming
  { zip: "82001", city: "Cheyenne", stateCode: "WY" },
]
