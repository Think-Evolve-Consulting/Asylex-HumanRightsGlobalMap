const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const getVal = (feat) =>
  feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);
fetch("../data/finalUpdatedGeoJSON.json")
  .then((res) => res.json())
  .then((countries) => {
    // console.log(countries)
    const maxVal = Math.max(...countries.features.map(getVal));
    colorScale.domain([0, maxVal]);
    const world = Globe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .lineHoverPrecision(0)
      .labelText(countries?.properties?.BRK_NAME)
      .polygonsData(
        countries.features.filter((d) => d.properties.ISO_A2 !== "AQ")
      )
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
            let relevantReservations = d?.releventReservations;

            let UNTreatyBodyData = committeesDetails?.UNTrendyBody?.filter(
              function (item) {
                return committees.indexOf(item?.committee) !== -1;
              }
            );

            const relevantReservation = Object.keys(d?.releventReservations);
            // const relevantReservationValue = Object.values(d?.releventReservations);

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

// pdf download function

const downLoadPdf = document.getElementById("downloadPdf");
window.jsPDF = window.jspdf.jsPDF;

function downloadPdf(button, dynamicValue) {
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF();
  const country = dynamicValue.split("_")[0];
  let committees = dynamicValue.split("_")[1];
  let institutions = dynamicValue.split("_")[2];

  fetch("../data/UNTrendyBodyAndRegionalOnes.json")
    .then((res) => res.json())
    .then((committeesDetails) => {
      let UNTreatyBodyData = committeesDetails?.UNTrendyBody?.filter(function (
        item
      ) {
        return committees.indexOf(item?.committee) !== -1;
      });
      let regionalHumanRightsMechanismData =
        committeesDetails?.regionalOnes?.filter(function (item) {
          return institutions.indexOf(item?.institution) !== -1;
        });

      // add text to the PDF document
      doc.text(`Human Rights Mechanisms`, 105, 10, null, null, "center");
      doc.text(`For`, 105, 18, null, null, "center");

      // Country Name
      doc.setTextColor("#3083ff");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(`${country}`, 105, 26, null, null, "center");

      // UN Treaty Body title
      doc.setFontSize(16);
      doc.setTextColor("#000000");
      doc.setFont("helvetica", "bold");
      doc.text("UN Treaty Body: ", 10, 40);

      if (UNTreatyBodyData?.length === 0) {
        // doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#000000");

        // set the font size and line height
        var fontSize = 12;
        var lineHeight = 0.5;

        // set the description text
        var descriptionText = `In ${country}, no relevant international human rights complaint mechanisms are available for (rejected) asylum seekers. If you still wish to take initiative in the context, please assess the further possibilities applicable to all countries listed below.`;

        // split the description text into an array of strings that fit within the width of the document
        var splitText = doc.splitTextToSize(descriptionText, 250);

        // add the split text to the PDF document
        doc.setFontSize(fontSize);
        for (var i = 0; i < splitText.length; i++) {
          doc.text(splitText[i], 10, 50 + i * fontSize * lineHeight);
        }
      } else {
        UNTreatyBodyData.map((un, i) => {
          // UN Treaty Body commits Names
          doc.setFontSize(16);
          doc.setFont("times", "normal");
          doc.setTextColor("#000000");
          doc.text(`> ${un?.abbreviations}`, 15, 50 + i * 30);

          // UN Treaty Body commits Links
          doc.setFontSize(12);
          doc.setFont("times", "normal");
          doc.setTextColor("#3083ff");
          doc.textWithLink("Individual Complaint", 20, 60 + i * 30, {
            url: un?.individualComplaintLink,
          });
          doc.textWithLink("Inquiry", 20, 70 + i * 30, { url: un?.enquiry });
        });
      }

      if (UNTreatyBodyData?.length === 0) {
        doc.setFontSize(16);
        doc.setTextColor("#000000");
        doc.setFont("helvetica", "bold");
        doc.text("Regional Human Rights Mechanism: ", 10, 80);
      } else {
        doc.setFontSize(16);
        doc.setTextColor("#000000");
        doc.setFont("helvetica", "bold");
        doc.text(
          "Regional Human Rights Mechanism: ",
          10,
          80 + (UNTreatyBodyData.length - 1) * 30
        );
      }

      if (
        regionalHumanRightsMechanismData.length === 0 ||
        !regionalHumanRightsMechanismData
      ) {
        // doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#000000");
        // set the font size and line height
        var fontSize = 12;
        var lineHeight = 0.5;
        // set the description text
        let descriptionTextRHRM = `In ${country}, no Regional Human Rights Mechanism are available for (rejected) asylum seekers.`;
        // split the description text into an array of strings that fit within the width of the document
        var splitTextRHRM = doc.splitTextToSize(descriptionTextRHRM, 250);

        // add the split text to the PDF document

        if (UNTreatyBodyData?.length === 0) {
          doc.setFontSize(fontSize);
          for (var i = 0; i < splitTextRHRM.length; i++) {
            doc.text(splitTextRHRM[i], 10, 90 + i * fontSize * lineHeight);
          }
        } else {
          doc.setFontSize(fontSize);
          for (var i = 0; i < splitTextRHRM.length; i++) {
            doc.text(
              splitTextRHRM[i],
              10,
              90 +
                (UNTreatyBodyData.length - 1) * 30 +
                i * fontSize * lineHeight
            );
          }
        }
      } else {
        regionalHumanRightsMechanismData.map((un, i) => {
          // Links
          doc.setFontSize(12);
          doc.setFont("times", "normal");
          doc.setTextColor("#3083ff");
          doc.textWithLink(
            un?.abbreviations,
            20,
            90 + (UNTreatyBodyData.length - 1) * 30 + i * 10,
            { url: un?.IndividualComplaint }
          );
        });
      }

      // create a new page
      doc.addPage();

      // add some content to the second page
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#000000");   
      doc.text("HR Mechanisms in All States", 105, 10, null, null, "center");


      // Heading
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Institution", 10, 30);
      doc.text("Mechanism", 70, 30);

      // Next line
      doc.text("Name and Link Complaint Procedure", 60, 80);


      // Text link style
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.setTextColor("#3083ff");
      
      // Institution
      doc.text("Human Rights Council", 10, 40);
      doc.text("ECOSOC", 10, 50);

      // Mechanism
      doc.text("Special Procedures", 70, 40);
      doc.text("HRC Complaint Procedure", 70, 50);
      doc.text("Commission on the Status of Women", 70, 60);

      // Blank
      doc.text("Working Groups", 140, 40);
      doc.text("Special Rapporteurs", 140, 50);

      // Name and Link Complaint Procedure      
      doc.textWithLink("Working Group on Arbitrary Detention (WGAD)", 10, 90 , { url: "https://www.ohchr.org/en/special-procedures/wg-arbitrary-detention/complaints-and-urgent-appeals" })

      doc.textWithLink("Working Group on Enforced or Involuntary Disappearances (WGEID)", 10, 100 , { url: "https://www.ohchr.org/en/special-procedures/wg-disappearances/reporting-disappearance-working-group" })

      doc.textWithLink("Submission to Special Procedures", 10, 110 , { url: "https://spsubmission.ohchr.org" })

      doc.textWithLink("Submitting information to Special Rapporteur", 10, 120 , { url: "https://spinternet.ohchr.org/ViewAllCountryMandates.aspx?Type=TM" })
      
      doc.textWithLink("Link", 10, 130, { url: "https://www.unwomen.org/en/csw/communications-procedure" })

      doc.save(`Human Rights Mechanisms_${country}.pdf`);
    });
}
