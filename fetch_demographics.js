const Client = require('fhir-kit-client');
const Config = require('./config');
const baseUrl = Config.ServerEndpoint();
// const PatientIdentifierSystem = Config.PatientIdentifierSystem();
// const PatientIdentifierValue='L01_1_T05'
module.exports={GetPatientPhoneAndEmail};

async function GetPatientPhoneAndEmail(baseUrl,PatientIdentifierSystem,PatientIdentifierValue)
   {
   var aux=""; 

   // Get patient data
   const patient = await GetPatient(
      baseUrl,
      PatientIdentifierSystem,
      PatientIdentifierValue
   )

   aux = 'Error:Patient_Not_Found';

   if (patient) {

      aux = 'Emails:-\nPhones:-\n'

// Filter out telecom entries that has either email or phone, and create string
      if (patient.telecom) {
         let emails = "Emails:"
         let phones = "Phones:"

         patient.telecom.forEach((item) => {

            if (item.system === "email") {
               emails += `${item.value}(${item.use}),` 
            } 

            if (item.system === "phone") {
               phones += `${item.value}(${item.use}),` 
            }

            if (item.system !== "email" && item.system !== "phone") {
               emails = "Emails:- "
               phones = "Phones:- "
            }

         })
            
         if (emails.length <= 10) emails = "Emails:- "
         if (phones.length <= 10) phones = "Phones:- "
         
         // create a string with email and phones
         aux = emails.slice(0, -1) + "\n" + phones.slice(0, -1) +"\n"
         return aux
      }
      return aux
   }
   return aux
}

async function GetPatient(baseUrl,patientidentifiersystem,patientidentifiervalue)
{
   const fhirClient = new Client({
      baseUrl: baseUrl
   });

   var PatientInfo = null;
   let searchResponse = await fhirClient.search(
      { resourceType: 'Patient', 
      searchParams: { identifier: patientidentifiersystem+"|"+patientidentifiervalue } 
      }
   );
   entries = searchResponse.entry;
   if (entries) { PatientInfo = entries[0].resource;}
   return PatientInfo;
}


// GetPatientPhoneAndEmail(baseUrl,PatientIdentifierSystem,PatientIdentifierValue)f