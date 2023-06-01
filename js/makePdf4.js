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


        /* // Inserting additional data to the object // UNTreatyBody
        UNTreatyBodyData = UNTreatyBodyData.map(((data, i) => {                
          const c = arrayCommittees.filter(a => a === data.committee );

          return ({
            ...data           
          })
        }));
  */
        



        /* // Define column headers and keys for data extraction
        const headers = ["Committee", "Individual Complaint", "Inquiry", "Relevant Reservations"];
        const keys = ["abbreviations", "individualComplaint", "Inquiry", "relevantReservations"];

        // Set initial y position for table
        let yPos = 60;

        doc.setFontSize(12);
        doc.setFont("times", "normal");

        // Loop through data and add rows to the table
        UNTreatyBodyData.forEach((row, index) => {
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
              doc.textWithLink("link", xPos + colIndex * 50, yPos, {
                url: value,
              });
            } else {
              const value = row[key];
              doc.text(xPos + colIndex * 50, yPos, value.toString());
            }
          });
          yPos += 10;
        }); */

        // Define column headers and keys for data extraction
        const headers = [
          "Committee",
          "Individual Complaint",
          "Inquiry",
          "Relevant Reservations",
        ];
        const keys = [
          "abbreviations",
          "IndividualComplaint",
          "Inquiry",
          "relevantReservations",
        ];

        // Set initial y position for table
        let yPos = 60;

        doc.setFontSize(12);
        doc.setFont("times", "normal");

        

        // Loop through data and add rows to the table
        UNTreatyBodyData.forEach((row, index) => {
          const xPos = 10;
          // Add headers to the first row
          if (index === 0) {
            headers.forEach((header, colIndex) => {
              doc.text(xPos + colIndex * 50, yPos, header);
            });
            yPos += 10;
          }

          // Add data rows
          keys.forEach((key, colIndex) => {
            let colWidth = 50;
            if (key === "abbreviations") {
              const value = row[key];
              const maxWidth = colWidth; // Maximum width for the cell
              const lineHeight = 10; // Line height for wrapped text
              const lines = doc.splitTextToSize(value?.toString(), maxWidth);             
              doc.text(xPos + colIndex * colWidth, yPos, lines); // Print the wrapped text

            } else if (key === "IndividualComplaint") {
              const value = row[key];
              if(value === "Yes"){
                doc.textWithLink("Yes", xPos + colIndex * colWidth, yPos, {
                  url: "https://www.ohchr.org/en/documents/tools-and-resources/form-and-guidance-submitting-individual-communication-treaty-bodies",
                });
              } else {
                doc.text(xPos + colIndex * colWidth, yPos, "-");
              }
            } else if(key === "Inquiry"){
              const value = row[key];
              if(value === "Yes"){
                doc.textWithLink("Yes", xPos + colIndex * colWidth, yPos, {
                  url: "https://www.ohchr.org/en/treaty-bodies/complaints-about-human-rights-violations#inquiries",
                });
              } else {
                doc.text(xPos + colIndex * colWidth, yPos, "-");
              }
            }
            else {
              const value = row[key];
              if(value === undefined){

              } else {
                doc.text(xPos + colIndex * colWidth, yPos, value.toString());
              }
              //doc.text(xPos + colIndex * colWidth, yPos, value.toString());              
            }
          });
          yPos += 10;
        });

        // Define column headers and keys for data extraction
       /*  const headers = [
          "Committee",
          "Individual Complaint",
          "Inquiry",
          "Relevant Reservations",
        ];
        const keys = [
          "abbreviations",
          "individualComplaint",
          "Inquiry",
          "relevantReservations",
        ];

        // Set initial y position for table
        let yPos = 60;

        doc.setFontSize(12);
        doc.setFont("times", "normal");

        // Loop through data and add rows to the table
        UNTreatyBodyData.forEach((row, index) => {
          const xPos = 10;
          // Add headers to the first row
          if (index === 0) {
            headers.forEach((header, colIndex) => {
              doc.text(xPos + colIndex * 50, yPos, header);
            });
            yPos += 10;
          }

          // Add data rows
          keys.forEach((key, colIndex) => {
            const cellWidth = 50;
            const cellHeight = 10;
            const value = row[key].toString();
            let lines = doc.splitTextToSize(value, cellWidth);

            if (lines.length > 1) {
              // Adjust yPos based on the number of wrapped lines
              yPos += (lines.length - 1) * cellHeight;
            }

            if (key === "abbreviations") {
              doc.text(xPos + colIndex * cellWidth, yPos, lines);
            } else if (key === "link") {
              doc.textWithLink("link", xPos + colIndex * cellWidth, yPos, {
                url: value,
              });
            } else {
              doc.text(xPos + colIndex * cellWidth, yPos, value);
            }
          });

          yPos += cellHeight; // Move to the next row
        }); */

        // end
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
      doc.text("HR Mechanisms in All States", 105, 20, null, null, "center");

      // define the table data

      const data = [
        [
          "Institution",
          "Mechanism(s)",
          "Specific Procedures",
          "Name and Link Complaint Procedure",
        ],
        [
          "Human Rights Council",
          "Special Procedures",
          "Working Groups",
          "Working Group on Arbitrary Detention (WGAD)",
        ],
        [
          "Human Rights Council",
          "Special Procedures",
          "Working Groups",
          "Working Group on Enforced or Involuntary Disappearances (WGEID)",
        ],
        [
          "Human Rights Council",
          "Special Procedures",
          "Special Rapporteurs",
          "Working Group on Enforced or Involuntary Disappearances (WGEID)",
        ],
        ["Human Rights Council", "", "", "Submission to Special Procedures"],
        [
          "Human Rights Council",
          "Special Procedures",
          "Special Rapporteurs",
          "Submitting information to Special Rapporteur",
        ],
        [
          "Human Rights Council",
          "Human Rights Council Complaint Procedure",
          "Human Rights Council",
          "HRC Complaint Procedure (frequently asked questions)",
        ],

        ["ECOSOC", "Commission on the Status of Women", "", "Link"],
      ];

      // define the table options
      const options = {
        startY: 30,
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

      doc.save(`Human Rights Mechanisms_${country}.pdf`);
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
