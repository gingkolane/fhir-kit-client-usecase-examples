const Client = require("fhir-kit-client");
const Axios = require('axios'); 
module.exports = { CreateUSCoreR4LabObservation };
const Config = require("./config.js");
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();
// const PatientIdentifierValue='L04_1_T02';
// const ObservationStatusCode="final";
// const ObservationDateTime="2020-10-11T20:30:00Z";
// const ObservationLOINCCode="1975-2";
// const  ObservationLOINCDisplay="Bilirubin, serum";
// const ResultType="numeric";
// const  NumericResultValue="8.6";
// const  NumericResultUCUMUnit="mg/dl";
// const  CodedResultSNOMEDCode="";
// const  CodedResultSNOMEDDisplay="";

async function CreateUSCoreR4LabObservation(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue,
  ObservationStatusCode,
  ObservationDateTime,
  ObservationLOINCCode,
  ObservationLOINCDisplay,
  ResultType,
  NumericResultValue,
  NumericResultUCUMUnit,
  CodedResultSNOMEDCode,
  CodedResultSNOMEDDisplay
) {
  var aux = "";

  var patient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  aux = 'Error:Patient_Not_Found'

  if (patient) {

    //create newObs resource for the found patient

    const newObs = { "resourceType": "Observation",
      "meta": {
        "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab"
        ]
      },
      "status": ObservationStatusCode,
      "category": [
        {
          "coding": [
            {
              "system":
                "http://terminology.hl7.org/CodeSystem/observation-category",
              "code": "laboratory",
              "display": "Laboratory"
            }
          ],
          "text": "Laboratory"
        }
      ],
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": ObservationLOINCCode,
            "display": ObservationLOINCDisplay
          }
        ]
      },
      "subject": {
        "reference": "Patient/" + patient.id
      },
      "effectiveDateTime": ObservationDateTime
    };
    if (ResultType === "numeric") {
      
      newObs.valueQuantity =  
        {
         "value": NumericResultValue,
          "unit": NumericResultUCUMUnit,
          "system": "http://unitsofmeasure.org"
        }

    }
    if (ResultType === "Coded") {

      newObs.valueCodeableConcept = 
        {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": CodedResultSNOMEDCode,
              "display": CodedResultSNOMEDDisplay
            }
          ]
        }
    }

  //create a new observation resource

    const fhirClient = new Client({
      baseUrl: baseUrl,
      customHeaders:{
          "Content-Type":"application/fhir+json",
          "Accept":"application/fhir+json"
          }
      })

    let response = await fhirClient.create({
      resourceType: 'Observation',
      body: newObs
    })

    // console.log(response);
    aux = JSON.stringify(response)
    console.log(aux)

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



// CreateUSCoreR4LabObservation(
//   baseUrl,
//   PatientIdentifierSystem,
//   PatientIdentifierValue,
//   ObservationStatusCode,
//   ObservationDateTime,
//   ObservationLOINCCode,
//   ObservationLOINCDisplay,
//   ResultType,
//   NumericResultValue,
//   NumericResultUCUMUnit,
//   CodedResultSNOMEDCode,
//   CodedResultSNOMEDDisplay
// )