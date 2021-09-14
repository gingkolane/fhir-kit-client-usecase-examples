const Client = require("fhir-kit-client");
module.exports = { GetMedications };
const Config = require("./config.js");
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();

// check code with postman with:
// http://fhir.hl7fundamentals.org/r4/MedicationRequest?patient.identifier=http://fhirintermediate.org/patient_id|L03_2_T04

async function GetMedications(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue
) {
  var aux = "";

  const patient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  aux = "Error:Patient_Not_Found";

  if (patient) {
    const fhirClient = new Client({
      baseUrl: baseUrl,
    });
    let searchResponse = await fhirClient.search({
      resourceType: "MedicationRequest",
      searchParams: { subject: patient.id },
    });
    entries = searchResponse.entry;

    aux = "Error:No_Medications";

    if (entries) {
      const meds = entries.map((entry) => {
        // Get one medication information
        mStatus = entry.resource.status;
        mIntent = entry.resource.intent;
        mAuthoredOn = entry.resource.authoredOn;
        mCode = entry.resource.medicationCodeableConcept.coding[0].code;
        mDisplay = entry.resource.medicationCodeableConcept.coding[0].display;
        mRequester = entry.resource.requester.display;

        //Output in format: status|intent|authored_on|code:display|requester\n
        oneMed =`${mStatus}|${mIntent}|${mAuthoredOn}|${mCode}:${mDisplay}|${mRequester}\n`
        return oneMed;
      });
      // convert med array into string
      aux = meds.join("");
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

// GetMedications(baseUrl, PatientIdentifierSystem, PatientIdentifierValue);
