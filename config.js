// Here are servers used in the project

const ServerEndpoint = ()=> {
    return "http://wildfhir4.aegis.net/fhir4-0-0";
}
const TerminologyServerEndpoint = () => {
    return "https://snowstorm.ihtsdotools.org/fhir";
}

const PatientIdentifierSystem=()=>{
    return "http://fhirintermediate.org/patient_id";
}
exports.ServerEndpoint=ServerEndpoint;
exports.TerminologyServerEndpoint=TerminologyServerEndpoint;
exports.PatientIdentifierSystem=PatientIdentifierSystem;
