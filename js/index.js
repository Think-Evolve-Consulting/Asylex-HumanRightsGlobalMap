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

function fetchData() {
  fetch("../data/NotmatchedCountries.json")
    .then((res) => res.json())
    .then((committeesDetails) => {
      console.log(committeesDetails?.length);
    });

  fetch("../data/AsyLex_Global_Counturies.json")
    .then((res) => res.json())
    .then((committeesDetails) => {
      let allCountry = [];
      committeesDetails.map((country) => {
        allCountry.push(country.Country);
      });

      fetch("../data/finalUpdatedAdminCountryData5.json")
        .then((res) => res.json())
        .then((committeesDetails) => {
          let countries = [];
          let geoCountry = [];
          committeesDetails?.features.map((data) => {
            countries.push(data?.properties?.BRK_NAME);
            geoCountry.push({ Country: data?.properties?.BRK_NAME });
          });
          console.log(allCountry.length - countries.length);

          console.log({ geoCountry });

          // const notMatched = allCountry.filter(item => !countries.includes(item));

          const notMatched = [];

          for (let i = 0; i < allCountry.length; i++) {
            if (
              !countries.find(
                (item) => item.toLowerCase() === allCountry[i].toLowerCase()
              )
            ) {
              notMatched.push({ Country: allCountry[i] });
            }
          }

          console.log({ notMatched });
        });
    });
}

// fetchData()

/// Suggestion list for country

const countriesOnGeo = [
  {
    Country: "Afghanistan",
  },
  {
    Country: "Angola",
  },
  {
    Country: "Albania",
  },
  {
    Country: "United Arab Emirates",
  },
  {
    Country: "Argentina",
  },
  {
    Country: "Armenia",
  },
  {
    Country: "Antarctica",
  },
  {
    Country: "Fr. S. and Antarctic Lands",
  },
  {
    Country: "Australia",
  },
  {
    Country: "Austria",
  },
  {
    Country: "Azerbaijan",
  },
  {
    Country: "Burundi",
  },
  {
    Country: "Belgium",
  },
  {
    Country: "Benin",
  },
  {
    Country: "Burkina Faso",
  },
  {
    Country: "Bangladesh",
  },
  {
    Country: "Bulgaria",
  },
  {
    Country: "Bahamas",
  },
  {
    Country: "Bosnia and Herz.",
  },
  {
    Country: "Belarus",
  },
  {
    Country: "Belize",
  },
  {
    Country: "Bolivia",
  },
  {
    Country: "Brazil",
  },
  {
    Country: "Brunei",
  },
  {
    Country: "Bhutan",
  },
  {
    Country: "Botswana",
  },
  {
    Country: "Central African Rep.",
  },
  {
    Country: "Canada",
  },
  {
    Country: "Switzerland",
  },
  {
    Country: "Chile",
  },
  {
    Country: "China",
  },
  {
    Country: "CÃ´te d'Ivoire",
  },
  {
    Country: "Cameroon",
  },
  {
    Country: "Democratic Republic of the Congo",
  },
  {
    Country: "Republic of the Congo",
  },
  {
    Country: "Colombia",
  },
  {
    Country: "Costa Rica",
  },
  {
    Country: "Cuba",
  },
  {
    Country: "N. Cyprus",
  },
  {
    Country: "Cyprus",
  },
  {
    Country: "Czechia",
  },
  {
    Country: "Germany",
  },
  {
    Country: "Djibouti",
  },
  {
    Country: "Denmark",
  },
  {
    Country: "Dominican Rep.",
  },
  {
    Country: "Algeria",
  },
  {
    Country: "Ecuador",
  },
  {
    Country: "Egypt",
  },
  {
    Country: "Eritrea",
  },
  {
    Country: "Spain",
  },
  {
    Country: "Estonia",
  },
  {
    Country: "Ethiopia",
  },
  {
    Country: "Finland",
  },
  {
    Country: "Fiji",
  },
  {
    Country: "Falkland Is.",
  },
  {
    Country: "France",
  },
  {
    Country: "Gabon",
  },
  {
    Country: "United Kingdom",
  },
  {
    Country: "Georgia",
  },
  {
    Country: "Ghana",
  },
  {
    Country: "Guinea",
  },
  {
    Country: "Gambia",
  },
  {
    Country: "Guinea-Bissau",
  },
  {
    Country: "Eq. Guinea",
  },
  {
    Country: "Greece",
  },
  {
    Country: "Greenland",
  },
  {
    Country: "Guatemala",
  },
  {
    Country: "Guyana",
  },
  {
    Country: "Honduras",
  },
  {
    Country: "Croatia",
  },
  {
    Country: "Haiti",
  },
  {
    Country: "Hungary",
  },
  {
    Country: "Indonesia",
  },
  {
    Country: "India",
  },
  {
    Country: "Ireland",
  },
  {
    Country: "Iran",
  },
  {
    Country: "Iraq",
  },
  {
    Country: "Iceland",
  },
  {
    Country: "Israel",
  },
  {
    Country: "Italy",
  },
  {
    Country: "Jamaica",
  },
  {
    Country: "Jordan",
  },
  {
    Country: "Japan",
  },
  {
    Country: "Kazakhstan",
  },
  {
    Country: "Kenya",
  },
  {
    Country: "Kyrgyzstan",
  },
  {
    Country: "Cambodia",
  },
  {
    Country: "Republic of Korea",
  },
  {
    Country: "Kosovo",
  },
  {
    Country: "Kuwait",
  },
  {
    Country: "Laos",
  },
  {
    Country: "Lebanon",
  },
  {
    Country: "Liberia",
  },
  {
    Country: "Libya",
  },
  {
    Country: "Sri Lanka",
  },
  {
    Country: "Lesotho",
  },
  {
    Country: "Lithuania",
  },
  {
    Country: "Luxembourg",
  },
  {
    Country: "Latvia",
  },
  {
    Country: "Morocco",
  },
  {
    Country: "Moldova",
  },
  {
    Country: "Madagascar",
  },
  {
    Country: "Mexico",
  },
  {
    Country: "Macedonia",
  },
  {
    Country: "Mali",
  },
  {
    Country: "Myanmar",
  },
  {
    Country: "Montenegro",
  },
  {
    Country: "Mongolia",
  },
  {
    Country: "Mozambique",
  },
  {
    Country: "Mauritania",
  },
  {
    Country: "Malawi",
  },
  {
    Country: "Malaysia",
  },
  {
    Country: "Namibia",
  },
  {
    Country: "New Caledonia",
  },
  {
    Country: "Niger",
  },
  {
    Country: "Nigeria",
  },
  {
    Country: "Nicaragua",
  },
  {
    Country: "Netherlands",
  },
  {
    Country: "Norway",
  },
  {
    Country: "Nepal",
  },
  {
    Country: "New Zealand",
  },
  {
    Country: "Oman",
  },
  {
    Country: "Pakistan",
  },
  {
    Country: "Panama",
  },
  {
    Country: "Peru",
  },
  {
    Country: "Philippines",
  },
  {
    Country: "Papua New Guinea",
  },
  {
    Country: "Poland",
  },
  {
    Country: "Puerto Rico",
  },
  {
    Country: "Dem. Rep. Korea",
  },
  {
    Country: "Portugal",
  },
  {
    Country: "Paraguay",
  },
  {
    Country: "Palestine",
  },
  {
    Country: "Qatar",
  },
  {
    Country: "Romania",
  },
  {
    Country: "Russia",
  },
  {
    Country: "Rwanda",
  },
  {
    Country: "W. Sahara",
  },
  {
    Country: "Saudi Arabia",
  },
  {
    Country: "Sudan",
  },
  {
    Country: "S. Sudan",
  },
  {
    Country: "Senegal",
  },
  {
    Country: "Solomon Is.",
  },
  {
    Country: "Sierra Leone",
  },
  {
    Country: "El Salvador",
  },
  {
    Country: "Somaliland",
  },
  {
    Country: "Somalia",
  },
  {
    Country: "Serbia",
  },
  {
    Country: "Suriname",
  },
  {
    Country: "Slovakia",
  },
  {
    Country: "Slovenia",
  },
  {
    Country: "Sweden",
  },
  {
    Country: "Swaziland",
  },
  {
    Country: "Syria",
  },
  {
    Country: "Chad",
  },
  {
    Country: "Togo",
  },
  {
    Country: "Thailand",
  },
  {
    Country: "Tajikistan",
  },
  {
    Country: "Turkmenistan",
  },
  {
    Country: "Timor-Leste",
  },
  {
    Country: "Trinidad and Tobago",
  },
  {
    Country: "Tunisia",
  },
  {
    Country: "Turkey",
  },
  {
    Country: "Taiwan",
  },
  {
    Country: "Tanzania",
  },
  {
    Country: "Uganda",
  },
  {
    Country: "Ukraine",
  },
  {
    Country: "Uruguay",
  },
  {
    Country: "United States",
  },
  {
    Country: "Uzbekistan",
  },
  {
    Country: "Venezuela",
  },
  {
    Country: "Vietnam",
  },
  {
    Country: "Vanuatu",
  },
  {
    Country: "Yemen",
  },
  {
    Country: "South Africa",
  },
  {
    Country: "Zambia",
  },
  {
    Country: "Zimbabwe",
  },
];

// Get the search input field and suggestions list
const searchInput = document.getElementById("search-input");
const suggestionsList = document.getElementById("suggestions");

/* // Add event listener to the search input field
searchInput.addEventListener("input", () => {
  // Get the search query and filter the country names
  const query = searchInput.value.toLowerCase();
  const filteredCountries = countriesOnGeo.filter((country) =>
    country.Country.toLowerCase().includes(query)
  );

  // Clear the suggestions list
  suggestionsList.innerHTML = "";

  // Add the filtered country names as suggestions to the list
  filteredCountries.forEach((country) => {
    const suggestion = document.createElement("li");
    suggestion.textContent = country.name;
    suggestion.addEventListener("click", () => {
      // Set the selected country as the input field value
      searchInput.value = country.name;

      // Focus the map on the selected country
      world.pointOfView({ lat: country.latlng[0], lng: country.latlng[1] }, 1);

      // Remove the suggestions list
      suggestionsList.innerHTML = "";
    });
    suggestionsList.appendChild(suggestion);
  });
}); */
