// pdf download function

const downLoadPdf = document.getElementById("downloadPdf");
window.jsPDF = window.jspdf.jsPDF;

function downloadPdf(button, dynamicValue) {
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF();
  const country = dynamicValue.split("_")[0];

  let committees = dynamicValue.split("_")[1];
  let Inquiry = dynamicValue
    .split("_")[4]
    .split(",")
    .map((item) => item.trim());
  let relevantReservations = dynamicValue
    .split("_")[5]
    .split(",")
    .map((item) => item.trim());

  let institutions = dynamicValue.split("_")[2];
  let IndividualComplaint = dynamicValue
    .split("_")[3]
    .split(",")
    .map((item) => item.trim());
  let IndividualComplaintRHRM = dynamicValue
    .split("_")[6]
    .split(",")
    .map((item) => item.trim());

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
        // Pushing the IndividualComplaint to inside the object
        UNTreatyBodyData = UNTreatyBodyData.map((row, index) => ({
          ...row,
          IndividualComplaint: IndividualComplaint[index],
          Inquiry: Inquiry[index],
          relevantReservations: relevantReservations[index],
        }));

        let columns = [
          { header: "Committee", dataKey: "abbreviations" },
          { header: "Individual Complaint", dataKey: "IndividualComplaint" },
          { header: "Inquiry", dataKey: "Inquiry" },
          { header: "Relevant Reservations", dataKey: "relevantReservations" },
        ];

        doc.autoTable({
          head: [columns.map((column) => column.header)],
          body: UNTreatyBodyData.map((row) =>
            columns.map((column) => row[column.dataKey])
          ),
          didDrawCell: function (data) {
            // draw a border around the cell
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height
            );
          },
          bodyStyles: { fontSize: 10 },
          headStyles: {
            textColor: ["fff", 0, 0],
            fontSize: 12,
            fontStyle: "bold",
          },
          startY: 50,
          startX: 10,
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
        /* regionalHumanRightsMechanismData.map((un, i) => {
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
        }); */

        // Pushing the IndividualComplaint to inside the object
        regionalHumanRightsMechanismData = regionalHumanRightsMechanismData.map(
          (row, index) => ({
            ...row,
            IndividualComplaintRHRM: IndividualComplaintRHRM[index],
          })
        );

        let columns = [
          { header: "Institution", dataKey: "abbreviations" },
          {
            header: "Individual Complaint",
            dataKey: "IndividualComplaintRHRM",
          },
        ];

        doc.autoTable({
          head: [columns.map((column) => column.header)],
          body: regionalHumanRightsMechanismData.map((row) =>
            columns.map((column) => row[column.dataKey])
          ),
          didDrawCell: function (data) {
            // draw a border around the cell
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height
            );
          },
          bodyStyles: { fontSize: 10 },
          headStyles: {
            textColor: ["fff", 0, 0],
            fontSize: 12,
            fontStyle: "bold",
          },
          startY: 90 + (UNTreatyBodyData.length - 1) * 30,
          startX: 10,
        });
      }

      // create a new page // 2nd page
      doc.addPage();

      // add some content to the second page
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#000000");
      doc.text("HR Mechanisms in All States", 105, 10, null, null, "center");

      // define the table data

      const data = [
        ["Institution", "Mechanism", "", "Name and Link Complaint Procedure"],
        [
          "",
          "Human Rights Council",
          "",
          "Working Group on Arbitrary Detention (WGAD)",
        ],
        [
          "",
          "",
          "Working Groups",
          "Working Group on Enforced or Involuntary Disappearances (WGEID)",
        ],
        [
          "",
          "Special Procedures",
          "Special Rapporteurs",
          "Working Group on Enforced or Involuntary Disappearances (WGEID)",
        ],
        ["", "", "", "Submission to Special Procedures"],
        ["", "", "", "Submitting information to Special Rapporteur"],
        [
          "",
          "Human Rights Council Complaint Procedure",
          "Human Rights Council",
          "HRC Complaint Procedure (frequently asked questions)",
        ],

        ["ECOSOC", "Commission on the Status of Women", "", "Link"],
      ];

      // define the table options
      const options = {
        startY: 20,
      };

      // create the table
      doc.autoTable({
        head: [data[0]],
        body: data.slice(1),
        didDrawCell: function (data) {
          // draw a border around the cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
        },
        ...options,
      });

      //
      doc.addPage();
      // Define your table data
      var tableData = [
        ["Link 1", "https://example.com/link1"],
        ["Link 2", "https://example.com/link2"],
        // Add more rows as needed
      ];

      // Define table headers
      var tableHeaders = ["Title", "Link"];

      // Create the table using jspdf-autotable-alt
      doc.autoTableAlt({
        head: [tableHeaders],
        body: tableData,
        columnStyles: {
          Link: {
            fontStyle: "bold",
            textColor: [0, 0, 255],
            cellWidth: "auto",
          },
        },
        didDrawCell: function (data) {
          // Check if the current cell is in the "Link" column
          if (data.column.dataKey === "Link") {
            var text = data.cell.raw;
            var link = data.row.raw[1];
            doc.setTextColor(0, 0, 255); // Set text color to blue
            doc.textWithLink(text, data.cell.x, data.cell.y + 5, { url: link });
          }
        },
      });

      doc.save(`Human Rights Mechanisms_${country}.pdf`);
    });
}

function downloadPdf2() {
  //  Define your table data
  var tableData = [
    ["Link 1", { text: "Link", link: "https://example.com/link1" }],
    ["Link 2", { text: "Go to Link 2", link: "https://example.com/link2" }],
    // Add more rows as needed
  ];

  // Define table headers
  var tableHeaders = ["Title", "Link"];

  // Create the table definition
  var table = {
    headerRows: 1,
    widths: ["*", "*"],
    body: [tableHeaders, ...tableData],
  };

  // Define the document definition
  var docDefinition = {
    content: [{ text: "Table with Links", style: "header" }, { table: table }],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      link: {
        color: "blue",
        decoration: "underline",
      },
    },
    defaultStyle: {
      // Set the default style for links
      link: true,
    },
    // Add an event handler for link clicks
    // This will navigate to the link URL when clicked
    // Note: This works in the generated PDF, not in the browser preview
    // Use the downloaded PDF to test the link functionality
    // It may not work if the link is an external URL due to security restrictions
    eventHandlers: {
      link: function (event, link) {
        window.open(link, "_blank");
      },
    },
  };

  // Generate the PDF
  pdfMake.createPdf(docDefinition).download("table_with_links.pdf");
}
