const Client = require("fhir-kit-client");
module.exports = { GetIPSMedications, GetIPSImmunizations };
const Config = require("./config.js");
// const { GetMedications } = require("./L03_2_fetch_medications.js");
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();


async function GetIPSMedications(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue
) {
  var aux = "";

  const patient = await GetPatient(baseUrl,PatientIdentifierSystem,PatientIdentifierValue) 
  aux = "Error:Patient_Not_Found";

  if (patient) {
    const fhirClient = new Client ({baseUrl: baseUrl})

    const searchResponse = await fhirClient.search(
        {resourceType: "Bundle",
        searchParams: {
          "composition.patient": patient.id, 
          "composition.type": "http://loinc.org|60591-5"
        }
      }
    )

    aux = "Error:No_IPS"

    if (searchResponse.entry) {

      // No medications when medicationCodeableConcept === "no-medication-info" or medicationCodeableConcept="no-known-medications"
      const resourceEntry = searchResponse.entry[0].resource.entry
      const medStatementArray = resourceEntry.filter(resource => resource.resource.resourceType === "MedicationStatement")
      const noMedTag = medStatementArray[0].resource.medicationCodeableConcept
      

      if (noMedTag) {

        aux = `${medStatementArray[0].resource.status}||${noMedTag.coding[0].code}:${noMedTag.coding[0].display}\n`

      } else {

        const medRecordArray = medStatementArray.map(medStatement => {

          //Get medicationStatement attributes
          const m_Status = medStatement.resource.status
          const m_date_period = medStatement.resource.effectivePeriod.start
  
          //Get medicationId from medicationStatement's medication reference
          const medId= medStatement.resource.medicationReference.reference.slice(-36);

          //Find medication resource from medicationId
          const foundMedication = resourceEntry.find((resource) => {return resource.fullUrl === "urn:uuid:"+ medId})
          
          //Get medication attributes
          const m_code= foundMedication.resource.code.coding[0].code 
          const m_display= foundMedication.resource.code.coding[0].display 

          //create oneMedRecord
          oneMedRecord = `${m_Status}|${m_date_period}|${m_code}:${m_display}\n`
  
          return oneMedRecord
  
        })

        aux = medRecordArray.join("")

      }
      return aux
    }
   return aux
  }
  return aux
}
  

async function GetIPSImmunizations(
   baseUrl,
   PatientIdentifierSystem,
   PatientIdentifierValue
 ) {
   var aux = "";
 
   const patient = await GetPatient(baseUrl,PatientIdentifierSystem,PatientIdentifierValue) 
 
   aux = "Error:Patient_Not_Found";
 
   if (patient) {
    const fhirClient = new Client ( {baseUrl: baseUrl} )
 
    const searchResponse = await fhirClient.search(
       {resourceType: "Bundle",
       searchParams: {
          "composition.subject": patient.id, 
          "composition.type": "http://loinc.org|60591-5"
       }
     }
    )
 
    aux = "Error: No_IPS"

    if (searchResponse.entry) {

      aux = "Error:IPS_No_Immunizations"

      // filter for immunization resources in the bundle
      const resourceEntry = searchResponse.entry[0].resource.entry
      const immuArray = resourceEntry.filter(resource => resource.resource.resourceType === "Immunization")

      // extract immunication record using map, immuArray could be [], ips with immu would have more than one item within array
      if (immuArray.length >=1 ) {

        const immuRecordArray = immuArray.map((item) => {
          const immu = item.resource;
          const iStatus = immu.status;
          const iCode = immu.vaccineCode.coding[0].code;
          const iDisplay = immu.vaccineCode.coding[0].display;
          const iDate = immu.occurrenceDateTime;
  
          const immuRecord = `${iStatus}|${iDate}|${iCode}:${iDisplay}\n`
          
          return immuRecord
        })
  
        aux = immuRecordArray.join("")

      }
      return aux
    }

    return aux;

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