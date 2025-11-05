// Global map variable for use by other scripts (like autocomplete.js)
let map;
let hoveredCountryId = null;

// Initialize MapLibre map
map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#0a0a1e'
        }
      },
      {
        id: 'raster-layer',
        type: 'raster',
        source: 'raster-tiles',
        paint: {
          'raster-opacity': 0.25
        }
      }
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
  },
  center: [0, 20],
  zoom: 1.5,
  projection: 'globe', // Start with globe projection
  maxZoom: 18,
  minZoom: 0.5
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// Add fullscreen control
map.addControl(new maplibregl.FullscreenControl(), 'top-right');

// Add globe control
const globeControl = new GlobeControl({ enabledByDefault: true });
map.addControl(globeControl, 'top-right');

// Load and add countries GeoJSON
map.on('load', async () => {
  try {
    const response = await fetch('./data/countries_small_updated_Aug2024.geojson');
    const countries = await response.json();

    // Add countries source
    map.addSource('countries', {
      type: 'geojson',
      data: countries,
      generateId: true // This ensures each feature has a unique id for hover effects
    });

    // Add country fill layer with colors
    map.addLayer({
      id: 'countries-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': ['get', 'colour'], // Use color from GeoJSON properties
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.95,
          0.75
        ]
      },
      filter: ['!=', ['get', 'ISO_A2'], 'AQ'] // Exclude Antarctica
    });

    // Add country border layer
    map.addLayer({
      id: 'countries-border',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': '#111',
        'line-width': 1
      },
      filter: ['!=', ['get', 'ISO_A2'], 'AQ'] // Exclude Antarctica
    });

    // Add hover effect
    map.on('mousemove', 'countries-fill', (e) => {
      if (e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';

        // Remove hover state from previous feature
        if (hoveredCountryId !== null) {
          map.setFeatureState(
            { source: 'countries', id: hoveredCountryId },
            { hover: false }
          );
        }

        hoveredCountryId = e.features[0].id;

        // Set hover state for current feature
        map.setFeatureState(
          { source: 'countries', id: hoveredCountryId },
          { hover: true }
        );
      }
    });

    map.on('mouseleave', 'countries-fill', () => {
      map.getCanvas().style.cursor = '';

      if (hoveredCountryId !== null) {
        map.setFeatureState(
          { source: 'countries', id: hoveredCountryId },
          { hover: false }
        );
      }
      hoveredCountryId = null;
    });

    // Add click handler
    map.on('click', 'countries-fill', async (e) => {
      const properties = e.features[0].properties;

      // Parse JSON strings (GeoJSON properties are stored as strings)
      const UNTreatyBody = JSON.parse(properties.UNTreatyBody || '[]');
      const regionalHumanRightsMechanism = JSON.parse(properties.regionalHumanRightsMechanism || '[]');

      // Handle case where country has no mechanisms
      if (UNTreatyBody.length === 0 && regionalHumanRightsMechanism.length === 0) {
        showPopup(`
          <div class="top-part content">
            <h2 style="margin: 0;">${properties.BRK_NAME}</h2>
            <button onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
          </div>
          <p>In <strong>${properties.BRK_NAME}</strong>, there are no dedicated international human rights complaint mechanisms for (rejected) asylum seekers. Please check other options available for all countries in the pop-up window at the bottom left.</p>
        `);
        return;
      }

      // Fetch additional details
      try {
        const response = await fetch('./data/UNTrendyBodyAndRegionalOnes.json');
        const committeesDetails = await response.json();

        let committees = UNTreatyBody.map((obj) => obj.Committee);
        let institutions = regionalHumanRightsMechanism.map((obj) => obj.Institution);

        let UNTreatyBodyData = committeesDetails?.UNTrendyBody?.filter(function (item) {
          return committees.indexOf(item?.committee) !== -1;
        });

        let regionalHumanRightsMechanismData = committeesDetails?.regionalOnes?.filter(function (item) {
          return institutions.indexOf(item?.institution) !== -1;
        });

        // Merge additional data
        const enrichedUNTreatyBody = UNTreatyBody.map((data) => {
          const c = UNTreatyBodyData.filter((a) => a.committee === data.Committee);
          return { ...data, ...c[0] };
        });

        const enrichedRegionalHRM = regionalHumanRightsMechanism.map((data) => {
          const I = regionalHumanRightsMechanismData.filter((a) => a.institution === data.Institution);
          return { ...data, ...I[0] };
        });

        let Inquiry = enrichedUNTreatyBody.map((obj) => obj.Inquiry);
        let RR = enrichedUNTreatyBody.map((obj) => obj.RelevantReservations);
        let IndividualComplaint = enrichedUNTreatyBody.map((obj) => obj.IndividualComplaint);
        let IndividualComplaintRHRM = enrichedRegionalHRM.map((obj) => obj.IndividualComplaint);

        // Passing parameter to the download pdf
        const string = `${properties.BRK_NAME}_${committees}_${institutions}_${IndividualComplaint}_${Inquiry}_${RR}_${IndividualComplaintRHRM}`;

        // Making html popup content
        let UNTreatyBodyTable = `
          <div class="top-part">
            <h2 style="margin: 0;">${properties.BRK_NAME}
              <button id="downloadPdf" onclick="downloadPdf(this, '${string}')" class="downloadBtn">
                <i class="fa-solid fa-file-arrow-down"></i>
              </button>
            </h2>
            <button onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
          </div>
          <h4>UN Treaty Body:</h4>
          <table>
            <tr>
              <th>Committee</th>
              <th>Individual Complaint</th>
              <th>Inquiry</th>
              <th>Relevant Reservations</th>
            </tr>
            ${enrichedUNTreatyBody.map((un) => {
              return `<tr>
                <td>${un?.abbreviations}</td>
                <td>${un?.IndividualComplaint == "Yes"
                  ? `<a target="_blank" href="https://www.ohchr.org/en/documents/tools-and-resources/form-and-guidance-submitting-individual-communication-treaty-bodies"><img src="./data/okImg.png" alt="ok img" width="15" /></a>`
                  : "-"
                }</td>
                <td>${un?.Inquiry == "Yes"
                  ? `<a target="_blank" href="https://www.ohchr.org/en/treaty-bodies/complaints-about-human-rights-violations#inquiries"><img src="./data/okImg.png" alt="ok img" width="15" /></a>`
                  : "-"
                }</td>
                <td>${un.RelevantReservations}</td>
              </tr>`;
            }).join(" ")}
          </table>
        `;

        let regionalHumanRightsMechanismTable = `
          <h4>Regional Human Rights Mechanism:</h4>
          <table>
            <tr>
              <th>Institution</th>
              <th>Individual Complaint</th>
            </tr>
            ${enrichedRegionalHRM.map((un) => {
              return `<tr>
                <td>${un?.abbreviations}</td>
                <td>${un?.IndividualComplaint == "Yes"
                  ? `<a target="_blank" href=${un?.individualComplaint}><img src="./data/okImg.png" alt="ok img" width="15" /></a>`
                  : "-"
                }</td>
              </tr>`;
            }).join(" ")}
          </table>
        `;

        showPopup(`
          ${UNTreatyBody.length === 0
            ? `<h4>UN Treaty Body:</h4><p> In <strong>${properties.BRK_NAME}</strong>, no relevant international human rights complaint mechanisms are available for (rejected) asylum seekers. If you still wish to take initiative in the context, please assess the further possibilities applicable to all countries listed below. </p>`
            : UNTreatyBodyTable
          }
          ${regionalHumanRightsMechanism.length === 0 || !regionalHumanRightsMechanism
            ? `<h4>Regional Human Rights Mechanism:</h4><p>In <strong>${properties.BRK_NAME}</strong>, no Regional Human Rights Mechanism are available for (rejected) asylum seekers.</p>`
            : regionalHumanRightsMechanismTable
          }
        `);

      } catch (error) {
        console.error('Error fetching committee details:', error);
        showPopup(`
          <div class="top-part content">
            <h2 style="margin: 0;">${properties.BRK_NAME}</h2>
            <button onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
          </div>
          <p>Error loading details for ${properties.BRK_NAME}. Please try again.</p>
        `);
      }
    });

    console.log('Map loaded successfully with', countries.features.length, 'countries');

  } catch (error) {
    console.error('Error loading countries data:', error);
  }
});

// Function for country search (used by autocomplete.js)
const searchCountry = (countryName) => {
  if (!map || !map.getSource('countries')) {
    console.error('Map or countries source not loaded yet');
    return;
  }

  const countries = map.getSource('countries')._data.features;
  const country = countries.find((c) =>
    c.properties.ADMIN?.toLowerCase().includes(countryName.toLowerCase()) ||
    c.properties.BRK_NAME?.toLowerCase().includes(countryName.toLowerCase())
  );

  if (country) {
    const bbox = country.bbox;
    if (bbox && bbox.length === 4) {
      // Calculate center of bounding box
      const center = [
        (bbox[0] + bbox[2]) / 2, // longitude
        (bbox[1] + bbox[3]) / 2  // latitude
      ];

      // Calculate zoom based on bbox size
      const latDiff = Math.abs(bbox[3] - bbox[1]);
      const lonDiff = Math.abs(bbox[2] - bbox[0]);
      const maxDiff = Math.max(latDiff, lonDiff);

      let zoom = 2;
      if (maxDiff < 1) zoom = 6;
      else if (maxDiff < 5) zoom = 5;
      else if (maxDiff < 10) zoom = 4;
      else if (maxDiff < 20) zoom = 3;

      map.flyTo({
        center: center,
        zoom: zoom,
        duration: 2000
      });
    }
  } else {
    console.warn('Country not found:', countryName);
  }
};

// Error handling
map.on('error', (e) => {
  console.error('MapLibre error:', e);
});
