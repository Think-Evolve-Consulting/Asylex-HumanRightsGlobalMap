const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);

let world;

const getVal = (feat) =>
  feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);
fetch("../data/countries_small_updated_Aug2023.geojson")
  .then((res) => res.json())
  .then((countries) => {
    const maxVal = Math.max(...countries.features.map(getVal));
    colorScale.domain([0, maxVal]);
    world = Globe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .lineHoverPrecision(0)
      .labelText(countries?.properties?.BRK_NAME)
      .polygonsData(
        countries.features.filter((d) => d.properties.ISO_A2 !== "AQ")
      )
      .polygonAltitude(0.06)
      .polygonCapColor((feat) => feat?.properties?.colour) // polygon color coming from color property
      .polygonSideColor(() => "rgba(0, 100, 0, 0.15)") // ground color
      .polygonStrokeColor(() => "#111")
      .onPolygonClick(({ properties: d }) => {
        if (
          d.UNTreatyBody.length === 0 &&
          d.regionalHumanRightsMechanism.length === 0
        ) {
          showPopup(`
                  <div class="top-part content">
                    <h2 style="margin: 0;">${d.BRK_NAME}</h2>
                    <button  onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
                  </div>
                  <p>In <strong>${d.BRK_NAME}</strong>, there are no dedicated international human rights complaint mechanisms for (rejected) asylum seekers. Please check other options available for all countries in the pop-up window at the bottom left.</p>
                  `);
          return;
        }

        /// matching the data start point // for additional data
        fetch("../data/UNTrendyBodyAndRegionalOnes.json")
          .then((res) => res.json())
          .then((committeesDetails) => {
            let committees = d?.UNTreatyBody.map((obj) => obj.Committee);
            let institutions = d?.regionalHumanRightsMechanism.map(
              (obj) => obj.Institution
            );

            let UNTreatyBodyData = committeesDetails?.UNTrendyBody?.filter(
              function (item) {
                return committees.indexOf(item?.committee) !== -1;
              }
            );

            let regionalHumanRightsMechanismData =
              committeesDetails?.regionalOnes?.filter(function (item) {
                return institutions.indexOf(item?.institution) !== -1;
              });

            // Inserting additional data to the object // UNTreatyBody
            d.UNTreatyBody = d.UNTreatyBody.map((data, i) => {
              const c = UNTreatyBodyData.filter(
                (a) => a.committee === data.Committee
              );
              return {
                ...data,
                ...c[0],
              };
            });

            d.regionalHumanRightsMechanism = d.regionalHumanRightsMechanism.map(
              (data, i) => {
                const I = regionalHumanRightsMechanismData.filter(
                  (a) => a.institution === data.Institution
                );
                return {
                  ...data,
                  ...I[0],
                };
              }
            );

            //////////////// without additional data code start
            // let committees = d?.UNTreatyBody.map((obj) => obj.Committee);
            let Inquiry = d?.UNTreatyBody.map((obj) => obj.Inquiry);
            let RR = d?.UNTreatyBody.map((obj) => obj.RelevantReservations); // Relevant Reservations
            let IndividualComplaint = d?.UNTreatyBody.map(
              (obj) => obj.IndividualComplaint
            );
            // let institutions = d?.regionalHumanRightsMechanism.map((obj) => obj.Institution);
            let IndividualComplaintRHRM = d?.regionalHumanRightsMechanism.map(
              (obj) => obj.IndividualComplaint
            );
            // Passing parameter to the download pdf
            const string = `${d.BRK_NAME}_${committees}_${institutions}_${IndividualComplaint}_${Inquiry}_${RR}_${IndividualComplaintRHRM}`;

            // Making html popup content
            let UNTreatyBodyTable = [
              `<div class="top-part">
          <h2 style="margin: 0;">${
            d.BRK_NAME
          } <button id="downloadPdf" onclick="downloadPdf(this, '${string}')" class="downloadBtn"><i class="fa-solid fa-file-arrow-down"></i></button> </h2>
          <button  onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
        </div>
        <h4>UN Treaty Body:</h4>
          <table>
          <tr>
            <th>Committee</th>
            <th>Individual Complaint</th>
            <th>Inquiry</th>
            <th>Relevant Reservations</th>
          </tr>
          ${d.UNTreatyBody?.map((un) => {
            return `<tr>
              <td>${un?.abbreviations}</td>
              <td>${
                un?.IndividualComplaint == "Yes"
                  ? `<a target="_blank" href="https://www.ohchr.org/en/documents/tools-and-resources/form-and-guidance-submitting-individual-communication-treaty-bodies"><img src="./data/okImg.png" alt="ok img" width="15" /></a>`
                  : "-"
              }</td>
              <td>${
                un?.Inquiry == "Yes"
                  ? `<a target="_blank" href="https://www.ohchr.org/en/treaty-bodies/complaints-about-human-rights-violations#inquiries"><img src="./data/okImg.png" alt="ok img" width="15" /></a>`
                  : "-"
              }</td>
              <td>${un.RelevantReservations}</td>
            </tr>`;
          }).join(" ")}
          </table>`,
            ];
            let regionalHumanRightsMechanismTable = [
              `
        <h4>Regional Human Rights Mechanism:</h4>
        <table>
          <tr>
            <th>Institution</th>
            <th>Individual Complaint</th>
          </tr>
          ${d.regionalHumanRightsMechanism
            ?.map((un) => {
              return `<tr>
              <td>${un?.abbreviations}</td>
              <td>${
                un?.IndividualComplaint == "Yes"
                  ? `<a target="_blank" href=${un?.individualComplaint}><img src="./data/okImg.png" alt="ok img" width="15" /></a>`
                  : "-"
              }</td>
            </tr>`;
            })
            .join(" ")}
        </table>`,
            ];

            showPopup(`
          ${
            d?.UNTreatyBody.length === 0
              ? `<h4>UN Treaty Body:</h4><p> In <strong>${d.BRK_NAME}</strong>, no relevant international human rights complaint mechanisms are available for (rejected) asylum seekers. If you still wish to take initiative in the context, please assess the further possibilities applicable to all countries listed below. </p>`
              : UNTreatyBodyTable
          }
          ${
            d?.regionalHumanRightsMechanism.length === 0 ||
            !d?.regionalHumanRightsMechanism
              ? `<h4>Regional Human Rights Mechanism:</h4><p>In <strong>${d.BRK_NAME}</strong>, no Regional Human Rights Mechanism are available for (rejected) asylum seekers.</p>`
              : regionalHumanRightsMechanismTable
          }
          `);
            ////////////////////// without additional data code end
          });

        ///////////////////// Previous code start ///////////////////////

        /* fetch("../data/UNTrendyBodyAndRegionalOnes.json")
          .then((res) => res.json())
          .then((committeesDetails) => {

            // Data getting from geojson
            let committees = d?.UNTreatyBody.map(obj => obj.Committee);
            

            let institutions = d?.regionalHumanRightsMechanism;
            let relevantReservations = d?.releventReservations;

            let UNTreatyBodyData = committeesDetails?.UNTrendyBody?.filter(
              function (item) {
                return committees.indexOf(item?.committee) !== -1;
              }
            );

            const relevantReservation = Object.keys(d?.releventReservations);

            //  Including reservations into the UNTreatyBodyData
            UNTreatyBodyData.map((data) => {
              if (data.committee.includes(relevantReservation)) {
                data.reservation = d?.releventReservations[data.committee];
              }
            });

            let regionalHumanRightsMechanismData =
              committeesDetails?.regionalOnes?.filter(function (item) {
                return institutions.indexOf(item?.institution) !== -1;
              });

            const reservation =
              d?.reservations === undefined
                ? ""
                : `<strong>Attention:</strong> When preparing a submission, <strong>${d.BRK_NAME}</strong> has made a reservation on article(s) <b>${d?.reservations}</b> to the Convention of this Committee`;

            let UNTreatyBody = [
              `<div>
                <h4>UN Treaty Body:</h4>
                  <ul>${UNTreatyBodyData?.map((un) => {
                    return `
                      <div>
                        <li><p>${un?.abbreviations}</p></li>
                        <p><a target="_blank" href=${
                          un?.individualComplaintLink
                        }>Individual Complaint</a></p>
                        <p><a target="_blank" href=${
                          un?.enquiry
                        }>Inquiry</a></p>
                        ${
                          un?.reservation
                            ? `<p><strong>Reservation:</strong> ${un?.reservation}</p>`
                            : ""
                        }
                      </div>`;
                  }).join(" ")}
              </div>`,
            ];

            let RegionalHuman = [
              `<h4 style="margin: 0;">Regional Human Rights Mechanism:</h4> <ul>${regionalHumanRightsMechanismData
                ?.map((un) => {
                  return `<li><a target="_blank" href=${un?.IndividualComplaint}>${un?.abbreviations}</a></li>`;
                })
                .join(" ")}</div>`,
            ];

            const string = `${d.BRK_NAME}_${committees}_${institutions}`;

            showPopup(`
                  <div class="top-part">
                    <h2 style="margin: 0;">${
                      d.BRK_NAME
                    } <button id="downloadPdf" onclick="downloadPdf(this, '${string}')" class="downloadBtn"><i class="fa-solid fa-file-arrow-down"></i></button> </h2>
                    <button  onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
                  </div>
                  ${
                    d?.UNTreatyBody[0]?.length === 0
                      ? `<h4>UN Treaty Body:</h4><p> In <strong>${d.BRK_NAME}</strong>, no relevant international human rights complaint mechanisms are available for (rejected) asylum seekers. If you still wish to take initiative in the context, please assess the further possibilities applicable to all countries listed below. </p>`
                      : UNTreatyBody
                  }                  
                  ${
                    d?.regionalHumanRightsMechanism[0]?.length === 0 ||
                    !d?.regionalHumanRightsMechanism
                      ? `<h4>Regional Human Rights Mechanism:</h4><p>In <strong>${d.BRK_NAME}</strong>, no Regional Human Rights Mechanism are available for (rejected) asylum seekers.</p>`
                      : RegionalHuman
                  }
                </div>`);
          }); */
        ///////////////////// Previous code end ///////////////////////
      })
      .polygonLabel(({ properties: d }) => `<b>${d.BRK_NAME} </b>`)
      .onPolygonHover((hoverD) =>
        world
          .polygonAltitude((d) => (d === hoverD ? 0.12 : 0.06))
          .polygonCapColor((d) => {
            // return d === hoverD ? "white" : d?.properties?.color;
          })
      )
      .polygonsTransitionDuration(300)(document.getElementById("globeViz"));
  });

// Set country point of view Function
const searchCountry = () => {
  // Get the value of the search input field
  const query = document.getElementById("myInput").value.toLowerCase();

  // Filter the countries data to find the matching country
  const countries = world.polygonsData();

  const country = countries.find((c) =>
    c.properties.ADMIN.toLowerCase().includes(query)
  );
  // If a matching country is found, focus the map on it
  if (country) {
    const bbox = country.bbox;
    let latitude_diff = bbox[3] - bbox[1];
    let longitude_diff = bbox[2] - bbox[0];
    let min_latitude = bbox[1];
    let max_longitude = bbox[2];
    let latitude_avg = min_latitude + latitude_diff / 2;
    let longitude_avg = max_longitude + longitude_diff / 2;
    world.pointOfView({ lat: latitude_avg, lng: longitude_avg }, 1);
  }
};
