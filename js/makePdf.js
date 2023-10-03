// pdf download function
const downLoadPdf = document.getElementById("downloadPdf");
window.jsPDF = window.jspdf.jsPDF;

// checkicon
const okIcon = "../data/okImg.png";

function downloadPdf(button, dynamicValue) {
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF();
  const country = dynamicValue.split("_")[0];

  const styles = {
    fillColor: "#fff",
    textColor: "#000",
    lineWidth: 0.1,
    lineColor: "#000",
  };

  const addLinkWithImgHandler = (link, data) => {
    data.cell.text = "";
    data.cell.raw = "";
    let textPos = data.cell;
    doc.setTextColor("#3083ff");
    doc.textWithLink(
      "  ",
      textPos.x + 4,
      textPos.y + 3,
      {
        url: link,
      },
      1,
      1
    );
    doc.addImage(okIcon, "png", textPos.x + 3, textPos.y + 2, 3, 3);
  };

  const addLinkWithoutIconHandler = (link, data, label) => {
    data.cell.text = "";
    data.cell.raw = "";
    let textPos = data.cell;
    doc.setTextColor("#3083ff");
    doc.textWithLink(`${label}`, textPos.x + 4, textPos.y + 7, {
      url: link,
      maxWidth: 55,
    });
  };

  const headerOfTable = () => {
    // add text to the PDF document
    doc.setTextColor("#000");
    doc.setFontSize(16);
    doc.setFont("helvetica");
    doc.text(`Human Rights Mechanisms`, 105, 10, null, null, "center");
    doc.text(`For`, 105, 18, null, null, "center");
    const imageURL = "../data/AsyLexGlobalLogo.jpg";
    doc.addImage(imageURL, "PNG", 165, 5, 40, 40);

    // Country Name
    doc.setTextColor("#3083ff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${country}`, 105, 26, null, null, "center");
  };

  fetch("../data/countries_small_updated_Aug2023.geojson")
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

          headerOfTable();

          // UN Treaty Body title
          doc.setFontSize(16);
          doc.setTextColor("#000000");
          doc.setFont("helvetica", "bold");
          doc.text("UN Treaty Body: ", 10, 40);

          // page 1
          const headers1 = [
            "Committee",
            "Individual Complaint",
            "Inquiry",
            "Relevant Reservations",
          ];
          const body1 = [];
          const indComplaint1 = [];
          const inquiryArr = [];
          const relevantRes = [];

          // page 2
          const headers2 = ["Institution", "Individual Complaint"];
          const body2 = [];
          const indComplaint2 = [];
          const indComplaintLinks = [];

          // page 3
          const headers3 = [
            "Institution",
            "Mechanism(s)",
            "Institution to be addressed",
            "Specific Procedures",
          ];
          const body3 = [];
          const mechanismsArr = [];
          const SpecificProcArr = [];
          const SpecificProcLinkLabelArr = [];
          const SpecificProcLinksArr = [];

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
            const keys = [
              "abbreviations",
              "IndividualComplaint",
              "Inquiry",
              "RelevantReservations",
            ];

            // Set initial y position for table
            let yPos = 50;

            doc.setFontSize(13);
            doc.setFont("times", "bold");

            // Loop through data and add rows to the table
            d.UNTreatyBody.forEach((row) => {
              let maxCellHeight = 40; // Maximum height for a cell
              let cellHeight = 10; // Default cell height

              doc.setFontSize(12);
              doc.setFont("times", "normal");

              // Add data rows
              keys.forEach((key) => {
                let colWidth = 50;
                if (key === "abbreviations") {
                  doc.setTextColor("#000");
                  const value = row[key];
                  const maxWidth = colWidth; // Maximum width for the cell
                  const lines = doc.splitTextToSize(
                    value?.toString(),
                    maxWidth
                  );

                  body1.push([lines.join(" ")]);

                  cellHeight = lines.length * 10; // Adjust cell height based on number of lines
                  if (cellHeight > maxCellHeight) cellHeight = maxCellHeight; // Limit cell height
                } else if (key === "IndividualComplaint") {
                  const value = row[key];
                  if (value === "Yes") {
                    indComplaint1.push("");
                  } else {
                    indComplaint1.push("-");
                  }
                } else if (key === "Inquiry") {
                  const value = row[key];
                  if (value === "Yes") {
                    inquiryArr.push("");
                  } else {
                    inquiryArr.push("-");
                  }
                } else {
                  const value = row[key];
                  if (value !== undefined) {
                    relevantRes.push(value.toString());
                  }
                }
              });

              yPos += cellHeight;
            });

            body1.forEach((item, index) => {
              item.push([indComplaint1[index]]);
              item.push([inquiryArr[index]]);
              item.push([relevantRes[index]]);
            });

            doc.autoTable({
              head: [headers1],
              body: body1,
              startY: 50,
              startX: 10,
              margin: { top: 10, left: 10 },
              tableWidth: 190,
              styles: styles,
              didParseCell: function (data) {
                data.cell.styles.cellPadding = 3;
              },
              didDrawCell: function (data) {
                if (data.cell.section === "body" && data.cell.text[0] === "") {
                  if (data.column.index === 1) {
                    let link =
                      "https://www.ohchr.org/en/documents/tools-and-resources/form-and-guidance-submitting-individual-communication-treaty-bodies";
                    addLinkWithImgHandler(link, data);
                  } else if (data.column.index === 2) {
                    let link =
                      "https://www.ohchr.org/en/treaty-bodies/complaints-about-human-rights-violations#inquiries";
                    addLinkWithImgHandler(link, data);
                  }
                }
              },
            });
            // End
          }

          // add another page
          doc.addPage();

          headerOfTable();

          if (UNTreatyBodyData?.length === 0) {
            doc.setFontSize(16);
            doc.setTextColor("#000000");
            doc.setFont("helvetica", "bold");
            doc.text("Regional Human Rights Mechanism: ", 10, 20);
          } else {
            doc.setFontSize(16);
            doc.setTextColor("#000000");
            doc.setFont("helvetica", "bold");
            doc.text("Regional Human Rights Mechanism: ", 10, 40);
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

            doc.setFontSize(fontSize);
            for (var i = 0; i < splitTextRHRM.length; i++) {
              doc.text(splitTextRHRM[i], 10, 50 + i * fontSize * lineHeight);
            }
          } else {
            const keys = ["abbreviations", "individualComplaint"];

            // Set initial y position for table
            let yPos = 30;

            doc.setFontSize(13);
            doc.setFont("times", "bold");

            // Loop through data and add rows to the table
            d.regionalHumanRightsMechanism.forEach((row) => {
              const xPos = 10;
              let cellHeight = 10; // Default cell height

              doc.setFontSize(12);
              doc.setFont("times", "normal");

              // Add data rows
              keys.forEach((key, colIndex) => {
                let colWidth = 140;
                if (key === "abbreviations") {
                  const value = row[key];
                  const lines = doc.splitTextToSize(value?.toString());
                  body2.push([lines.join(" ")]);
                } else if (key === "individualComplaint") {
                  const value = row[key];
                  indComplaint2.push("");
                  indComplaintLinks.push(value);
                } else {
                  const value = row[key];
                  if (value !== undefined) {
                    doc.text(
                      xPos + colIndex * colWidth,
                      yPos,
                      value.toString()
                    );
                  }
                }
              });

              yPos += cellHeight; // Adjust yPos based on cell height
            });

            body2.forEach((item, index) => {
              item.push([indComplaint2[index]]);
            });

            doc.autoTable({
              head: [headers2],
              body: body2,
              startY: 50,
              startX: 10,
              margin: { top: 10, left: 10 },
              tableWidth: 190,
              styles: styles,
              didParseCell: function (data) {
                data.cell.styles.cellPadding = 3;
              },
              didDrawCell: function (data) {
                if (data.cell.section === "body" && data.cell.text[0] === "") {
                  if (data.column.index === 1) {
                    addLinkWithImgHandler(
                      indComplaintLinks[data.row.index],
                      data
                    );
                  }
                }
              },
            });
            // End
          }

          // create a new page // 2nd page
          doc.addPage();

          // add text to the PDF document
          headerOfTable();

          // add some content to the second page
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.setTextColor("#000000");
          doc.text("Human Rights Mechanisms in All States", 10, 40, null, null);

          // define the table data
          const hrMechanismsTableData = [
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Working Groups",
              LinkComplaint: "Working Group on Arbitrary Detention (WGAD)",
              abbreviations: "Working Group on Arbitrary Detention (WGAD)",
              link: "https://www.ohchr.org/en/special-procedures/wg-arbitrary-detention/complaints-and-urgent-appeals",
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Working Groups",
              LinkComplaint:
                "Working Group on Enforced or Involuntary Disappearances (WGEID)",
              abbreviations:
                "Working Group on Enforced or Involuntary Disappearances (WGEID)",
              link: "https://www.ohchr.org/en/special-procedures/wg-arbitrary-detention/complaints-and-urgent-appeals",
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Special Rapporteurs",
              LinkComplaint: "Submission to Special Procedures",
              abbreviations: "Submission to Special Procedures",
              link: "https://spsubmission.ohchr.org/",
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Special Procedures",
              SpecificProcedures: "Special Rapporteurs",
              LinkComplaint: "Submitting information to Special Rapporteur",
              abbreviations: "Submitting information to Special Rapporteur",
              link: "https://spinternet.ohchr.org/ViewAllCountryMandates.aspx?Type=TM",
            },
            {
              Institution: "Human Rights Council",
              Mechanisms: "Human Rights Council Complaint Procedure",
              SpecificProcedures: "Human Rights Council",
              LinkComplaint:
                "HRC Complaint Procedure (frequently asked questions)",
              abbreviations:
                "HRC Complaint Procedure (frequently asked questions)",
              link: "https://www.ohchr.org/en/hr-bodies/hrc/complaint-procedure/hrc-complaint-procedure-index",
            },
            {
              Institution: "ECOSOC",
              Mechanisms: "Commission on the Status of Women",
              SpecificProcedures: "",
              LinkComplaint: "",
              abbreviations: "Commission on the Status of Women",
              link: "https://www.unwomen.org/en/csw/communications-procedure",
            },
          ];

          // Make
          const keys = [
            "Institution",
            "Mechanisms",
            "SpecificProcedures",
            "link",
          ];

          // Set initial y position for table
          let yPos = 30;

          doc.setFontSize(11);
          doc.setFont("times", "bold");

          // Loop through data and add rows to the table
          hrMechanismsTableData.forEach((row, index) => {
            let cellHeight = 10; // Default cell height

            // Add data rows
            keys.forEach((key) => {
              if (key === "Institution") {
                const value = row["Institution"];
                body3.push([value]);
              } else if (key === "LinkComplaint" || key === "Mechanisms") {
                doc.setTextColor("#000");
                const value = row[key];
                const lines = doc.splitTextToSize(value?.toString());
                mechanismsArr.push([lines.join(" ")]);
              } else if (key === "SpecificProcedures") {
                const value = row["SpecificProcedures"];
                SpecificProcArr.push([value]);
              } else if (key === "link") {
                const value = row[key];
                const name = row["abbreviations"];
                SpecificProcLinkLabelArr.push(name);
                SpecificProcLinksArr.push(value);
              }
            });

            yPos += cellHeight; // Adjust yPos based on cell height
          });

          body3.forEach((item, index) => {
            item.push([mechanismsArr[index]]);
            item.push([SpecificProcArr[index]]);
          });
          doc.autoTable({
            head: [headers3],
            body: body3,
            startY: 50,
            startX: 10,
            margin: { top: 10, left: 10 },
            tableWidth: 190,
            styles: styles,
            didParseCell: function (data) {
              data.cell.styles.cellPadding = 3;
              const contentHeight = doc.getTextDimensions(data.cell.text).h;
              const cellHeight = contentHeight + 18;
              data.row.height = cellHeight;
              if (data.cell.section === "body" && data.cell.text[0] === "") {
                if (data.column.index === 3) {
                  data.table.columns[3].minWidth = 60;
                }
              }
              if (data.cell.section === "body") {
                if (data.column.index === 0 && data.row.index === 0) {
                  data.cell.rowSpan = 5;
                }
                if (data.column.index === 1 && data.row.index === 0) {
                  data.cell.rowSpan = 4;
                }
                if (data.column.index === 2 && data.row.index === 0) {
                  data.cell.rowSpan = 2;
                }
                if (data.column.index === 2 && data.row.index === 2) {
                  data.cell.rowSpan = 2;
                }
              }
            },
            didDrawCell: function (data) {
              if (data.cell.section === "body" && data.cell.text[0] === "") {
                if (data.column.index === 3) {
                  addLinkWithoutIconHandler(
                    SpecificProcLinksArr[data.row.index],
                    data,
                    SpecificProcLinkLabelArr[data.row.index]
                  );
                }
              }
            },
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
