const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const getVal = (feat) => feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);
fetch("../data/finalUpdatedAdminCountryData4.json")
  .then((res) => res.json())
  .then((countries) => {
    const maxVal = Math.max(...countries.features.map(getVal));
    colorScale.domain([0, maxVal]);
    const world = Globe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .lineHoverPrecision(0)
      .labelText(countries?.properties?.BRK_NAME)
      .polygonsData(countries.features.filter((d) => d.properties.ISO_A2 !== "AQ"))
      .polygonAltitude(0.06)
      .polygonCapColor((feat) => feat?.properties?.color) // polygon color coming from color property
      .polygonSideColor(() => "rgba(0, 100, 0, 0.15)") // ground color
      .polygonStrokeColor(() => "#111")
      .onPolygonClick(({ properties: d }) => {
        
       

        if (d.UNTreatyBody === undefined) {        
          showPopup(`
                  <div class="top-part content">
                    <h2 style="margin: 0;">${d.BRK_NAME}</h2>
                    <button  onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
                  </div>
                  <p>In <strong>${d.BRK_NAME}</strong>, there are no dedicated international human rights complaint mechanisms for (rejected) asylum seekers. Please check other options available for all countries in the pop-up window at the bottom left.</p>
                  `);
          return;
        }
        fetch("../data/UNTrendyBodyAndRegionalOnes.json")
          .then((res) => res.json())
          .then((committeesDetails) => {            
            let committees = d?.UNTreatyBody;
            let institutions = d?.regionalHumanRightsMechanism;
            let UNTreatyBodyData = committeesDetails?.UNTrendyBody?.filter(function (item) {
              return committees.indexOf(item?.committee) !== -1;
            });

            let regionalHumanRightsMechanismData = committeesDetails?.regionalOnes?.filter(function (item) {
              return institutions.indexOf(item?.institution) !== -1;
            });

            // console.log({institutions})

            const reservation = d?.reservations === undefined ? '':`<strong>Attention:</strong> When preparing a submission, <strong>${d.BRK_NAME}</strong> has made a reservation on article(s) <b>${d?.reservations}</b> to the Convention of this Committee`

            let UNTreatyBody = [
              `<div>
                <h4>UN Treaty Body:</h4>
                  <ul>${UNTreatyBodyData?.map((un) => {
                    return `
                      <div>
                        <li><p>${un?.abbreviations}</p></li>
                        <p><a target="_blank" href=${un?.individualComplaintLink}>Individual Complaint</a></p>
                        <p><a target="_blank" href=${un?.enquiry}>Inquiry</a></p>                        
                      </div>`;
                  }).join(" ")}

                  ${reservation}
              </div>`,
            ];
            let RegionalHuman = [
              `<h4 style="margin: 0;">Regional Human Rights Mechanism:</h4> <ul>${regionalHumanRightsMechanismData
                ?.map((un) => {
                  return `<li><a target="_blank" href=${un?.IndividualComplaint}>${un?.abbreviations}</a></li>`;
                })
                .join(" ")}</div>`,
            ];

            showPopup(`
                  <div class="top-part">
                    <h2 style="margin: 0;">${d.BRK_NAME} <button  onclick="downloadPdf()" class="downloadBtn"><i class="fa-solid fa-file-arrow-down"></i></button> </h2>
                    <button  onclick="hidePopup()" class="closeBtn"><i class="fa-sharp fa-solid fa-xmark"></i></button>
                  </div>
                  ${
                    d?.UNTreatyBody[0]?.length === 0
                      ? `<h4>UN Treaty Body:</h4><p> In <strong>${d.BRK_NAME}</strong>, no relevant international human rights complaint mechanisms are available for (rejected) asylum seekers. If you still wish to take initiative in the context, please assess the further possibilities applicable to all countries listed below. </p>`
                      : UNTreatyBody
                  }                  
                  ${d?.regionalHumanRightsMechanism[0]?.length === 0 || !d?.regionalHumanRightsMechanism ? `<h4>Regional Human Rights Mechanism:</h4><p>In <strong>${d.BRK_NAME}</strong>, no Regional Human Rights Mechanism are available for (rejected) asylum seekers.</p>` : RegionalHuman}
                </div>`);
          });
      })

      .onPolygonHover((hoverD) =>
        world
          .polygonAltitude((d) => (d === hoverD ? 0.12 : 0.06))
          .polygonCapColor((d) => {
            // return d === hoverD ? "white" : d?.properties?.color;
          })
      )
      .polygonsTransitionDuration(300)(document.getElementById("globeViz"));
  });
