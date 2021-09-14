const Client = require("fhir-kit-client");
module.exports = { GetEthnicity };
const Config = require("./config.js");
const baseUrl = Config.ServerEndpoint();
const PatientIdentifierSystem = Config.PatientIdentifierSystem();
// const PatientIdentifierValue = "L02_1_T04";

async function GetEthnicity(
  baseUrl,
  PatientIdentifierSystem,
  PatientIdentifierValue
) {
   //get patient
  const patient = await GetPatient(
    baseUrl,
    PatientIdentifierSystem,
    PatientIdentifierValue
  );

  // If patient not found
  aux = "Error:Patient_Not_Found";

  // If patient found
  if (patient) {
      // if no extension not found
      aux = "Error:No_us-core-ethnicity_Extension"; // test return should be "error: no extension"

      if (patient.extension) {
         // find uscore-conformant extension
         const uscore_extension = patient.extension.find(extension => extension.url === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity")

         // if uscore_extension found
         if (uscore_extension) {
            
            var auxText = ''
            var auxOmb = ''
            var auxDetailed = ''
   
            uscore_extension.extension.forEach((item)=> {
   
               switch (item.url) {
                  
                  case "text":
                     auxText += "text|" + item.valueString + "\n";
                     break
                  case "ombCategory":
                     auxOmb = auxOmb + "code|" + item.valueCoding.code + ":" + item.valueCoding.display + "\n";
                     break
                  case "detailed":
                     auxDetailed += "detail|" + item.valueCoding.code + ":" + item.valueCoding.display + "\n";
                     break
                  default:
                     break
               }
               // if not US-core conformant
               if (auxText == "" || auxOmb== "") {
                  aux = "Error:Non_Conformant_us-core-ethnicity_Extension"
                  // return here bypass the uscore conformant output
                  return aux
               }
   
               // if US-core conformant
               aux = auxText + auxOmb + auxDetailed
   
            })
            return aux
         }
         return aux;
      } 
      return aux;
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

// GetPatient(baseUrl, PatientIdentifierSystem, PatientIdentifierValue);
// GetEthnicity(baseUrl, PatientIdentifierSystem, PatientIdentifierValue);
