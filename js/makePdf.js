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
          "Human Rights Council",
          "",
          "Working Groups",
          "Working Group on Arbitrary Detention (WGAD)",
        ],
        [
          "",
          "",
          "Special Rapporteurs",
          "Working Group on Enforced or Involuntary Disappearances (WGEID)",
        ],
        [
          "",
          "Special Procedures",
          "",
          "Working Group on Enforced or Involuntary Disappearances (WGEID)",
        ],
        ["", "", "", "Submission to Special Procedures"],
        [
          "",
          "HRC Complaint Procedure",
          "",
          "Submitting information to Special Rapporteur > Link",
        ],
        ["ECOSOC", "Commission on the Status of Women", "", "Link", ""],
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

      doc.save(`Human Rights Mechanisms_${country}.pdf`);
    });
}
