const popup = document.querySelector("#popup-container");
const table = document.querySelector("#table");
const tableBtn = document.querySelector("#tableBtn");
const content = document.getElementById("content");

function showPopup(data) {
  popup.innerHTML = data;
  popup.style.display = "block";
}

function hidePopup() {
  popup.style.display = "none";
  document.removeEventListener("click", hidePopupOnClickOutside);
}

function hideTable() {
  table.style.display = "none";
  tableBtn.style.display = "block";
}

function showTable() {
  table.style.display = "block";
  tableBtn.style.display = "none";
}

function hidePopupOnClickOutside(event) {
  if (!popup.contains(event.target)) {
    hidePopup();
  }
}


function fetchData () {

  fetch("../data/NotmatchedCountries.json")
          .then((res) => res.json())
          .then((committeesDetails) => {

            console.log(committeesDetails?.length)

          })
  
  fetch("../data/AsyLex_Global_Counturies.json")
          .then((res) => res.json())
          .then((committeesDetails) => {

            let allCountry = [];
            committeesDetails.map(country => {
              allCountry.push(country.Country)
            })




            fetch("../data/finalUpdatedAdminCountryData5.json")
          .then((res) => res.json())
          .then((committeesDetails) => {
            let countries = [];
            let geoCountry = [];          
            committeesDetails?.features.map(data => {
              countries.push(data?.properties?.BRK_NAME)
              geoCountry.push({Country: data?.properties?.BRK_NAME})
            })            
            console.log(allCountry.length - countries.length)

            console.log({geoCountry})

            // const notMatched = allCountry.filter(item => !countries.includes(item));

            const notMatched = [];

            for (let i = 0; i < allCountry.length; i++) {
              if (!countries.find(item => item.toLowerCase() === allCountry[i].toLowerCase())) {
                notMatched.push({Country: allCountry[i]});
              }
            }

          console.log({notMatched})

          })






          })

          

          



      }

      fetchData()
