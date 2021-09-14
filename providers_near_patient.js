const Client = require("fhir-kit-client");
module.exports = { GetProvidersNearCity };
const Config = require("./config.js");
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();
// const PatientIdentifierValue = "L01_3_T05";

async function GetProvidersNearCity(
  server,
  PatientIdentifierSystem,
  PatientIdentifierValue
) {
  var aux = "";

  const myPatient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  aux = "Error:Patient_Not_Found";

  if (myPatient) {

    aux = "Error:Patient_w/o_City"
    
    if (myPatient.address) {
      const myPatientCity = myPatient.address[0].city
    //search for practitioner in the same city as myPatient
      const fhirClient = new Client({
        baseUrl: server,
      });
      const searchResponse = await fhirClient.search({
        resourceType: "Practitioner",
        searchParams: { "address-city": myPatientCity },
      });

      aux = "Error:No_Provider_In_Patient_City"

    //if practitioner found, create a list of providers
      if (searchResponse.entry) {
        entries = searchResponse.entry;
        console.log(entries)

        const providerList = entries.map((entry) => {
            let provider = entry.resource;
            console.log(provider)

            let fullName = `${
            provider.name[0].family
            },${provider.name[0].given.join(" ")}`;
            let address = provider.address[0].line.join(" ");
            let telecom =
            provider.telecom[0].system + ":" + provider.telecom[0].value;
            let qualification =
            provider.qualification[0].code.coding[0].display;
            
            let providerInfo = `${fullName}|${telecom}|${address}|${qualification}\n`;
            
            return providerInfo;
        });

    // Convert providerList to a string for output
        aux = providerList.join('')
      }
      return aux
    }

    return aux
  }
  return aux
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

// GetProvidersNearCity(baseUrl, PatientIdentifierSystem, PatientIdentifierValue);
