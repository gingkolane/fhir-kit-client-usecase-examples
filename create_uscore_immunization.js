const Client = require("fhir-kit-client");
const Axios = require('axios'); 
const Config = require("./config.js");
module.exports = { CreateUSCoreR4Immunization };
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();

async function CreateUSCoreR4Immunization(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue,
  ImmunizationStatusCode,
  ImmunizationDateTime,
  ProductCVXCode,
  ProductCVXDisplay,
  ReasonCode
) {
  var aux = "";
  var patient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  aux = 'Error:Patient_Not_Found'

  if (patient) {

    const newImmunization = {
      "resourceType": "Immunization",
      "meta": { 
        "profile": [
          "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
        ]
      },
      "status" : ImmunizationStatusCode,
      "vaccineCode": {
        "coding":[
          {
            "system" : "http://hl7.org/fhir/sid/cvx",
            "code" : ProductCVXCode,
            "display" : ProductCVXDisplay
          }
        ]
      },
      "patient": {
        "reference": "Patient/" + patient.id,
      },
      "occurrenceDateTime": ImmunizationDateTime,
      "statusReason": {
        "coding":[
          {
            "system" : "http://terminology.hl7.org/CodeSystem/v3-ActReason",
            "code" : ReasonCode,
            "display" : ReasonCode
          }
        ]
      },
      "primarySource": false
    }

    //create a new immunization resource
    const fhirClient = new Client({
      baseUrl: baseUrl,
      customHeaders:{
        "Content-Type":"application/fhir+json",
        "Accept":"application/fhir+json"
        }
      })

    let response = await fhirClient.create({
        resourceType: 'Immunization',
        body: newImmunization
      })
  
      aux = JSON.stringify(response)
 
  }

  return aux

}

async function GetPatient(server,patientidentifiersystem,patientidentifiervalue)
{
  const fhirClient = new Client({
  baseUrl: server
  });

  var PatientInfo = null;
  let searchResponse = await fhirClient
  .search({ resourceType: 'Patient', searchParams: { identifier: patientidentifiersystem+"|"+patientidentifiervalue } });
  entries = searchResponse.entry;
  if (entries)
  {
  PatientInfo = entries[0].resource;
  }
  return PatientInfo;
}

// Note: For US. core immunization
// statusReason is a must-support - why immunization not done. 
// primarySource mandatory 