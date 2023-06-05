// pdf download function
const downLoadPdf = document.getElementById("downloadPdf");
window.jsPDF = window.jspdf.jsPDF;

function downloadPdf(button, dynamicValue) {
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF();
  const country = dynamicValue.split("_")[0];  

  fetch("../data/Countries_small_updated_June2023.geojson")
    .then((res) => res.json())
    .then((mapData) => {
      let d = mapData?.features.filter(
        (d) => d.properties.BRK_NAME == country
      )[0].properties;
      let committees = d?.UNTreatyBody.map((obj) => obj.Committee);
      let institutions = d?.regionalHumanRightsMechanism.map(
        (obj) => obj.Institution
      );

      fetch("../data/UNTrendyBodyAndRegionalOnes.json")
        .then((res) => res.json())
        .then((committeesDetails) => {
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

          d.regionalHumanRightsMechanism = d.regionalHumanRightsMechanism.map(((data, i) => {
            const I = regionalHumanRightsMechanismData.filter(a => a.institution === data.Institution);
            return ({
              ...data,
              ...I[0]
            })
          }));

          // add text to the PDF document
          doc.text(`Human Rights Mechanisms`, 105, 10, null, null, "center");
          doc.text(`For`, 105, 18, null, null, "center");
          const imageURL = "../data/AsyLexGlobalLogo.jpg";
          doc.addImage(imageURL, "PNG", 165, 5, 40, 40);

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
            // Define column headers and keys for data extraction
            const headers = ["Committee","Individual Complaint","Inquiry","Relevant Reservations",];
            const keys = ["abbreviations","IndividualComplaint","Inquiry","RelevantReservations",];

            // Set initial y position for table
            let yPos = 50;

            doc.setFontSize(13);
            doc.setFont("times", "bold");

            // Loop through data and add rows to the table
            d.UNTreatyBody.forEach((row, index) => {
              const xPos = 10;
              let maxCellHeight = 40; // Maximum height for a cell
              let cellHeight = 10; // Default cell height

              // Add headers to the first row
              if (index === 0) {
                headers.forEach((header, colIndex) => {
                  doc.text(xPos + colIndex * 50, yPos, header);
                });
                yPos += cellHeight;
              }

              doc.setFontSize(12);
              doc.setFont("times", "normal");

              // Add data rows
              keys.forEach((key, colIndex) => {
                let colWidth = 50;
                if (key === "abbreviations") {
                  doc.setTextColor("#000");
                  const value = row[key];
                  const maxWidth = colWidth; // Maximum width for the cell
                  const lines = doc.splitTextToSize( value?.toString(), maxWidth );

                  cellHeight = lines.length * 10; // Adjust cell height based on number of lines
                  if (cellHeight > maxCellHeight) cellHeight = maxCellHeight; // Limit cell height

                  doc.text(xPos + colIndex * colWidth, yPos, lines, {
                    lineHeight: 10,
                  }); // Print the wrapped text
                } else if (key === "IndividualComplaint") {
                  const value = row[key];
                  if (value === "Yes") {
                    doc.setTextColor("#3083ff");
                    doc.textWithLink("Yes", xPos + colIndex * colWidth, yPos, {
                      url: "https://www.ohchr.org/en/documents/tools-and-resources/form-and-guidance-submitting-individual-communication-treaty-bodies",
                    });
                  } else {
                    doc.text(xPos + colIndex * colWidth, yPos, "-");
                  }
                } else if (key === "Inquiry") {
                  const value = row[key];
                  if (value === "Yes") {
                    doc.setTextColor("#3083ff");
                    doc.textWithLink("Yes", xPos + colIndex * colWidth, yPos, {
                      url: "https://www.ohchr.org/en/treaty-bodies/complaints-about-human-rights-violations#inquiries",
                    });
                  } else {
                    doc.text(xPos + colIndex * colWidth, yPos, "-");
                  }
                } else {
                  const value = row[key];
                  if (value !== undefined) { 
                    doc.text(xPos + colIndex * colWidth, yPos, value.toString());
                  }
                }
              });

              yPos += cellHeight; // Adjust yPos based on cell height

            });

            // End
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
                doc.text(splitTextRHRM[i],10,90 + (UNTreatyBodyData.length - 1) * 30 + i * fontSize * lineHeight);
              }
            }
          } else {

            const headers = ["Institution","Individual Complaint"];
            const keys = ["abbreviations","individualComplaint"];

            // Set initial y position for table
            let yPos = 90 + (UNTreatyBodyData.length - 1) * 30;
            
            doc.setFontSize(13);
            doc.setFont("times", "bold");

            // Loop through data and add rows to the table
            d.regionalHumanRightsMechanism.forEach((row, index) => {
              const xPos = 10;
              let maxCellHeight = 40; // Maximum height for a cell
              let cellHeight = 10; // Default cell height

              // Add headers to the first row
              if (index === 0) {
                headers.forEach((header, colIndex) => {
                  doc.text(xPos + colIndex * 140, yPos, header);
                });
                yPos += cellHeight;
              }

              doc.setFontSize(12);
              doc.setFont("times", "normal");

              // Add data rows
              keys.forEach((key, colIndex) => {
                let colWidth = 140;
                if (key === "abbreviations") {
                  doc.setTextColor("#000");
                  const value = row[key];
                  const maxWidth = colWidth; // Maximum width for the cell
                  const lines = doc.splitTextToSize( value?.toString(), maxWidth );

                  cellHeight = lines.length * 10; // Adjust cell height based on number of lines
                  if (cellHeight > maxCellHeight) cellHeight = maxCellHeight; // Limit cell height

                  doc.text(xPos + colIndex * colWidth, yPos, lines, { lineHeight: 10 }); // Print the wrapped text
                } else if (key === "individualComplaint") {
                    const value = row[key];                 
                    doc.setTextColor("#3083ff");
                    doc.textWithLink("Yes", xPos + colIndex * colWidth, yPos, {
                      url: value.toString(),
                    });
                  
                } else {
                  const value = row[key];
                  if (value !== undefined) {
                    doc.text(xPos + colIndex * colWidth, yPos , value.toString());
                  }
                }
              });

              yPos += cellHeight; // Adjust yPos based on cell height
            });

          }

          // create a new page // 2nd page
          doc.addPage();

          // add some content to the second page
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.setTextColor("#000000");
          doc.text("HR Mechanisms in All States",105,20,null,null,"center");

          // define the table data
          const hrMechanismsTableData = [            
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Working Groups",
              LinkComplaint: "Working Group on Arbitrary Detention (WGAD)",
              link:"https://www.ohchr.org/en/special-procedures/wg-arbitrary-detention/complaints-and-urgent-appeals"
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Working Groups",
              LinkComplaint: "Working Group on Enforced or Involuntary Disappearances (WGEID)",
              link:"https://www.ohchr.org/en/special-procedures/wg-arbitrary-detention/complaints-and-urgent-appeals"
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Special Rapporteurs",
              LinkComplaint: "Submission to Special Procedures",
              link:"https://spsubmission.ohchr.org/"
            },            
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Special Rapporteurs",
              LinkComplaint: "Submitting information to Special Rapporteur",
              link: "https://spinternet.ohchr.org/ViewAllCountryMandates.aspx?Type=TM"
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Human Rights Council Complaint Procedure",
              SpecificProcedures: "Human Rights Council",
              LinkComplaint: "HRC Complaint Procedure (frequently asked questions)",
              link: "https://www.ohchr.org/en/hr-bodies/hrc/complaint-procedure/hrc-complaint-procedure-index"
            },
            {
              Institution: "ECOSOC",
              Mechanisms: "Commission on the Status of Women",
              SpecificProcedures: "",
              LinkComplaint: "",
              link: "https://www.unwomen.org/en/csw/communications-procedure"
            },
          ];

          // Make

          const headers =  ["Institution", "Mechanism(s)", "Specific Procedures", "Specific Procedures", "Links"];
          const keys = ["Institution","Mechanisms","SpecificProcedures","LinkComplaint", "link"];

            // Set initial y position for table
            let yPos = 30;
            
            doc.setFontSize(11);
            doc.setFont("times", "bold");

            // Loop through data and add rows to the table
            hrMechanismsTableData.forEach((row, index) => {
              const xPos = 10;
              let maxCellHeight = 40; // Maximum height for a cell
              let cellHeight = 10; // Default cell height

              // Add headers to the first row
              if (index === 0) {
                headers.forEach((header, colIndex) => {
                  doc.text(xPos + colIndex * 40, yPos, header);
                });
                yPos += cellHeight;
              }

              doc.setFontSize(11);
              doc.setFont("times", "normal");

              // Add data rows
              keys.forEach((key, colIndex) => {
                let colWidth = 40;
                if (key === "LinkComplaint" || key === "Mechanisms") {
                  doc.setTextColor("#000");
                  const value = row[key];
                  const maxWidth = colWidth; // Maximum width for the cell
                  const lines = doc.splitTextToSize( value?.toString(), maxWidth );

                  cellHeight = lines.length * 10; // Adjust cell height based on number of lines
                  if (cellHeight > maxCellHeight) cellHeight = maxCellHeight; // Limit cell height

                  doc.text(xPos + colIndex * colWidth, yPos, lines, { lineHeight: 10 }); // Print the wrapped text
                } else if (key === "link") {
                    const value = row[key];                 
                    doc.setTextColor("#3083ff");
                    doc.textWithLink("Link", xPos + colIndex * colWidth, yPos, {
                      url: value.toString(),
                    });
                  
                } else {
                  const value = row[key];
                  if (value !== undefined) {
                    doc.setTextColor("#000");
                    doc.text(xPos + colIndex * colWidth, yPos , value.toString());
                  }
                }
              });

              yPos += cellHeight; // Adjust yPos based on cell height
            });

          
          doc.save(`Human Rights Mechanisms_${country}.pdf`);
        });

      //  End fetch
    });
}

function downloadPdfn(button, dynamicValue) {
  // Sample array of objects
  const data = [
    { name: "John Doe", age: 30, link: "www.example.com" },
    { name: "Jane Smith", age: 25, link: "www.example.com" },
    { name: "Bob Johnson", age: 35, link: "www.example.com" },
  ];

  // Create a new jspdf document
  const doc = new jsPDF();

  // Define column headers and keys for data extraction
  const headers = ["Name", "Age", "Link"];
  const keys = ["name", "age", "link"];

  // Set initial y position for table
  let yPos = 20;

  // Loop through data and add rows to the table
  data.forEach((row, index) => {
    const xPos = 10;
    // Add headers to the first row
    if (index === 0) {
      headers.forEach((header, colIndex) => {
        // doc.setFontStyle('bold');
        doc.text(xPos + colIndex * 50, yPos, header);
      });
      yPos += 10;
    }

    // Add data rows
    keys.forEach((key, colIndex) => {
      if (key === "link") {
        const value = row[key];
        //   doc.setFontStyle('normal');
        doc.textWithLink("link", xPos + colIndex * 50, yPos, { url: value });
      } else {
        const value = row[key];
        doc.text(xPos + colIndex * 50, yPos, value.toString());
      }
    });
    yPos += 10;
  });

  // Save the PDF document
  doc.save("table.pdf");
}
