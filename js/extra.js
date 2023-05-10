var data = [
    { name: 'John Doe', email: 'john@example.com', country: 'United States', website: 'https://www.example.com' },
    { name: 'Jane Doe', email: 'jane@example.com', country: 'Canada', website: 'https://www.example.com' },
    { name: 'Bob Smith', email: 'bob@example.com', country: 'Australia', website: 'https://www.example.com' }
  ];

  const tableData = [
    {institution: 'Human Rights Council', mechanism:'', other: 'Working Groups',linkComplaintName: 'Working Group on Arbitrary Detention (WGAD)', linkComplaint: 'https://www.ohchr.org/en/special-procedures/wg-arbitrary-detention/complaints-and-urgent-appeals', },
    {institution: '', mechanism:'', other: 'Special Rapporteurs',linkComplaintName: 'Working Group on Enforced or Involuntary Disappearances (WGEID)', linkComplaint: 'https://www.ohchr.org/en/special-procedures/wg-disappearances/reporting-disappearance-working-group', },

    {institution: '', mechanism:'Special Procedures', other: '',linkComplaintName: 'Submission to Special Procedures', linkComplaint: 'https://spsubmission.ohchr.org', },

    {institution: '', mechanism:'HRC Complaint Procedure', other: '',linkComplaintName: 'Submitting information to Special Rapporteur', linkComplaint: 'https://spinternet.ohchr.org/ViewAllCountryMandates.aspx?Type=TM', },

    {institution: 'ECOSOC', mechanism:'Commission on the Status of Women', other: '',linkComplaintName: 'Link', linkComplaint: 'https://www.unwomen.org/en/csw/communications-procedure', },
  ];
  
  doc.autoTable({
    head: [['Institution', 'Mechanism', '', 'Link Complaint Procedure']],

    body: tableData.map(function(row) {
      return [row.institution, row.mechanism, row.other, row.linkComplaint, row.linkComplaintName ];
    }),
    didParseCell: function(data) {
      console.log(data)
      if (data.section === 'body' && data.column.index === 3) {
        // add a clickable link to the cell
        var link = { text: "Link", url: data.cell.raw[0], underline: true };
        data.cell.content = [link];
      }
    }
  });