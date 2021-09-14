const Client = require("fhir-kit-client");
module.exports = { GetDemographicComparison };
const Config = require("./config.js");

async function GetDemographicComparison(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue,
  myFamily,
  myGiven,
  myGender,
  myBirth
) {
  //Get patient data from fhir server
  const myPatient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  aux = "Error:Patient_Not_Found";

  if (myPatient) {
    // get specific patient data for comparison
    const remoteFamily = myPatient.name[0].family;
    const remoteGiven = myPatient.name[0].given.join(" ");
    const remoteGender = myPatient.gender;
    const remoteBirth = myPatient.birthDate; //this might be it

    // determine the match color for each comparison pair
    const familyNameMatch = (remoteFamily === myFamily) ? "green" : "red";
    const givenNameMatch = (remoteGiven === myGiven) ? "green" : "red";
    const genderMatch =
      (remoteGender.toUpperCase() === myGender.toUpperCase()) ? "green" : "red";
    const birthDateMatch = (remoteBirth === myBirth) ? "green" : "red";

    // create outout table
    aux = `{family}|${myFamily}|${remoteFamily}|{${familyNameMatch}}\n`
    +`{given}|${myGiven}|${remoteGiven}|{${givenNameMatch}}\n`
    +`{gender}|${myGender}|${remoteGender}|{${genderMatch}}\n`
    +`{birthDate}|${myBirth}|${remoteBirth}|{${birthDateMatch}}\n`;

  }
  return aux;
}

async function GetPatient(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue
) {
  const fhirClient = new Client({
    baseUrl: baseUrl,
  });

  var PatientInfo = null;
  let searchResponse = await fhirClient.search({
    resourceType: "Patient",
    searchParams: {
      identifier: PatientIdentifierSystem + "|" + PatientIdentifierValue,
    },
  });
  entries = searchResponse.entry;
  if (entries) {
    PatientInfo = entries[0].resource;
  }
  return PatientInfo;
}
