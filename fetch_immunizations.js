const Client = require("fhir-kit-client");
module.exports = { GetImmunizations };
const Config = require("./config.js");
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();
// const PatientIdentifierValue = "L03_1_T04";

// check response in postman with
// http://fhir.hl7fundamentals.org/r4/Immunization?patient.identifier=http://fhirintermediate.org/patient_id|L03_1_T04

async function GetImmunizations(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue
) {
  var aux = "";

  var patient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  aux = "Error:Patient_Not_Found";

  if (patient) {
    const fhirClient = new Client({
      baseUrl: baseUrl,
    });

    aux = "Error:No_Immunizations";

    let searchResponse = await fhirClient.search({
      resourceType: "Immunization",
      searchParams: { patient: patient.id },
    });

    entries = searchResponse.entry;

    if (entries) {
      aux = ""
      const immuArray = entries.map((e) => {
        var oneI = e.resource;
        iStatus = oneI.status;
        iCode = oneI.vaccineCode.coding[0].code;
        iDisplay = oneI.vaccineCode.coding[0].display;
        iDate = oneI.occurrenceDateTime;

        oneOutput = `${iStatus.toUpperCase()}|${iCode}:${iDisplay.trim().toUpperCase()}|${iDate}\n`
        
        return oneOutput
      });

      aux = immuArray.join("")

      return aux
    }
    return aux
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

  let PatientInfo = null;
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
// search parameters to find immunization belong to a patient
// http://fhir.hl7fundamentals.org/r4/Immunization?patient.identifier=http://fhirintermediate.org/patient_id|L03_1_T04
// GetImmunizations(baseUrl, PatientIdentifierSystem, PatientIdentifierValue);
