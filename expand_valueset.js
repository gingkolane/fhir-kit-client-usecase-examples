const axios = require("axios");
module.exports = { ExpandValueSetForCombo };

async function ExpandValueSetForCombo(baseUrl, Url, Filter) {
  var aux = "";
  var urlFHIREndpoint = baseUrl;
  var ResourceClass = "ValueSet";
  var OperationName = "$expand";
  var Parameters = "url=" + Url; 
  if (Filter != "") {
    Parameters = Parameters + "&" + "filter=" + Filter; //url points to the reference set, filter limits it
  }
  var FullURL =
    urlFHIREndpoint +
    "/" +
    ResourceClass +
    "/" +
    OperationName +
    "?" +
    Parameters;

  //We call the FHIR endpoint with our parameters

  let result = await axios.get(FullURL);
  var aux = "";
  if (result.data.expansion.contains) {
    result.data.expansion.contains.forEach((ec) => {
      aux += ec.code + "|" + ec.display + "\n";
    });
  }
  if (aux == "") {
    aux = "Error:ValueSet_Filter_Not_Found";
  }

  return aux;
}
