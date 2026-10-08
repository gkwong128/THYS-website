// netlify/functions/submit-popup.js
const { google } = require('googleapis');
const Mailjet = require('node-mailjet'); // Assuming Mailjet is still used here

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming data (name and email from the frontend;
    // size and source come from the /list QR signup page)
    const body = JSON.parse(event.body);
    const { flowType } = body;

    // Keep cell values short and stop anything a visitor types from being
    // read by Sheets as a formula (USER_ENTERED treats "=..." as a formula).
    const clean = (v, max) => {
      const s = String(v == null ? '' : v).trim().slice(0, max);
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    const name   = clean(body.name, 60);
    const email  = String(body.email || '').trim().slice(0, 120);
    const size   = clean(body.size, 30);
    const source = clean(body.source, 40);

    if (!name || !email || !/\S+@\S+\.\S+/.test(email)) { // Basic validation
      return { statusCode: 400, body: 'Missing name or invalid email' };
    }

    // --- Google Sheets API Setup ---
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'THYS emails'; // Your specific sheet tab name
    const nameColumn = 'B'; // Assuming Name is in Column B
    const emailColumn = 'C'; // Assuming Email is in Column C
    const sizeColumn = 'D'; // Shoe size (from /list)
    // Column E = Source (which QR code / event the signup came from)
    const fullEmailRange = `${sheetName}!${emailColumn}:${emailColumn}`; // Range to read emails

    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    // --- Check if Email Exists ---
    let existingRowIndex = -1;
    try {
        // *** This is the .get call you were missing ***
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: fullEmailRange, // Read Column C
        });

        const existingEmails = getResponse.data.values;
        if (existingEmails && existingEmails.length > 0) {
            // Find the index (row number - 1) of the email
            existingRowIndex = existingEmails.findIndex(row => row[0] && row[0].toLowerCase() === email.toLowerCase());
        }
    } catch (err) {
        // Handle cases where the sheet/range might be empty
        if (err.code === 400 && err.message.includes('Unable to parse range')) {
             console.log('Sheet or email column likely empty, proceeding to append.');
             existingRowIndex = -1; // Treat as not found
        } else {
            console.error('Error reading sheet:', err);
            throw new Error('Could not check existing emails.'); // Throw error to main catch
        }
    }

    // --- Conditional Action: Update or Append ---
    let sheetsResponseData;
    if (existingRowIndex !== -1) {
      // Email WAS found, update the name in the existing row
      const rowNumber = existingRowIndex + 1; // Sheet rows are 1-indexed
      const updateRange = `${sheetName}!${nameColumn}${rowNumber}`; // e.g., 'THYS emails'!B5
      console.log(`Email found at row ${rowNumber}, updating name in range: ${updateRange}`);

      // Update the name, and the size too if this signup included one
      const data = [{ range: updateRange, values: [[name]] }];
      if (size) data.push({ range: `${sheetName}!${sizeColumn}${rowNumber}`, values: [[size]] });

      const updateRequest = {
        spreadsheetId: sheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED', // Interpret input as if user typed it
          data,
        },
      };
      // *** This is the .batchUpdate call ***
      const updateResponse = await sheets.spreadsheets.values.batchUpdate(updateRequest);
      sheetsResponseData = updateResponse.data;
      console.log('Google Sheets name update response:', sheetsResponseData);

    } else {
      // Email NOT found, append a new row
      const valuesToAppend = [
        // Timestamp (A), Name (B), Email (C), Size (D), Source (E)
        [new Date().toISOString(), name, email, size, source || (flowType === 'list' ? 'direct' : 'website-popup')],
      ];
      const appendRequest = {
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E`, // Append to columns A through E
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: valuesToAppend },
      };
      // *** This is the .append call ***
      const appendResponse = await sheets.spreadsheets.values.append(appendRequest);
      sheetsResponseData = appendResponse.data;
      console.log('Google Sheets new row append response:', sheetsResponseData);
    }
    // --- End Conditional Action ---


    // QR-code signups (/list) get no confirmation email — the page's thank-you screen is enough
    if (flowType === 'list') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Data successfully processed!' }),
      };
    }

    // Determine Mailjet email content based on flowType
    let subject, textPart, htmlPart;
    if (flowType === 'download') {
      subject = "Here’s Your Product Guide";
      textPart = `Hello ${name},\n\nThank you for downloading our Product Guide! We hope you enjoy it.\n\nAccess it here:\nhttps://www.thys.co/productguide.pdf\n\nFeel free to reach out with any questions at info@thys.co.`;
      htmlPart = `
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="color-scheme" content="light only">
       <meta name="supported-color-schemes" content="light only">
     </head>
     <body data-ogsc="true" style="margin:0; padding:0; background-color:#ffffff!important; color:#000000!important;" bgcolor="#ffffff">
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;">
         <!-- Header -->
         <tr bgcolor="#000000" style="background-color:#000000!important;">
           <td align="center" style="padding:2rem;">
             <img src="https://www.thys.co/logo-inverted.png" alt="THYS Logo" style="display:block; max-width:200px; height:auto; mix-blend-mode: normal !important; filter: none !important;">
           </td>
         </tr>
         <!-- Content -->
         <tr>
           <td align="center" style="padding:2rem; background-color:#ffffff!important; color:#000000!important;">
             <h1 style="font-family:Italiana, serif; margin:0 0 1rem; color:#000000;">Your Product Guide</h1>
             <p style="font-family:Manrope, sans-serif; color:#333333; line-height:1.5; margin:0 0 1.5rem;">
               Hello ${name},<br><br>
               Thank you for downloading our <strong>Product Guide</strong>! We hope you find it insightful.
             </p>
             <a href="https://www.thys.co/productguide.pdf"
                style="display:inline-block; padding:0.75rem 1.5rem; background-color:#000000; color:#ffffff; text-decoration:none; border-radius:4px; font-family:Manrope, sans-serif;">
               View Product Guide
             </a>
           </td>
         </tr>
         <!-- Footer -->
         <tr bgcolor="#f5f5f5">
           <td align="center" style="padding:1.5rem;">
             <a href="https://www.instagram.com/thisisthys/" target="_blank" style="text-decoration:none;">
               <img src="https://www.thys.co/instagramicon.png" alt="Instagram" style="display:inline-block; width:32px; height:auto; margin:0 0.5rem; mix-blend-mode: normal !important; filter: none !important;">
             </a>
             <p style="font-family:Manrope, sans-serif; color:#333333; margin:1rem 0 0;">
               <a href="mailto:hello@thys.co" style="color:#333333; text-decoration:none;">hello@thys.co</a>
             </p>
           </td>
         </tr>
       </table>
     </body>
     </html>`;
    } else {
      subject = "Thanks for joining the THYS waitlist!";
      textPart = `Hello ${name},\n\nThank you for joining our waitlist! We’ll keep you updated with exclusive news and early access to THYS.`;
      htmlPart = `
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="color-scheme" content="light only">
       <meta name="supported-color-schemes" content="light only">
     </head>
     <body data-ogsc="true" style="margin:0; padding:0; background-color:#ffffff!important; color:#000000!important;" bgcolor="#ffffff">
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;">
         <!-- Header -->
         <tr bgcolor="#000000" style="background-color:#000000!important;">
           <td align="center" style="padding:2rem;">
             <img src="https://www.thys.co/logo-inverted.png" alt="THYS Logo" style="display:block; max-width:200px; height:auto; mix-blend-mode: normal !important; filter: none !important;">
           </td>
         </tr>
         <!-- Content -->
         <tr>
           <td align="center" style="padding:2rem; background-color:#ffffff!important; color:#000000!important;">
             <h1 style="font-family:Italiana, serif; margin:0 0 1rem; color:#000000;">Thanks for Joining Our Waitlist!</h1>
             <p style="font-family:Manrope, sans-serif; color:#333333; line-height:1.5; margin:0 0 1.5rem;">
               Hello ${name},<br><br>
               We’re thrilled to have you in the THYS community. You’ll be the first to receive exclusive updates and early access to THYS.
             </p>
           </td>
         </tr>
         <!-- Footer -->
         <tr bgcolor="#f5f5f5">
           <td align="center" style="padding:1.5rem;">
             <a href="https://www.instagram.com/thisisthys/" target="_blank" style="text-decoration:none;">
               <img src="https://www.thys.co/instagramicon.png" alt="Instagram" style="display:inline-block; width:32px; height:auto; margin:0 0.5rem; mix-blend-mode: normal !important; filter: none !important;">
             </a>
             <p style="font-family:Manrope, sans-serif; color:#333333; margin:1rem 0 0;">
               <a href="mailto:hello@thys.co" style="color:#333333; text-decoration:none;">hello@thys.co</a>
             </p>
           </td>
         </tr>
       </table>
     </body>
     </html>`;
    }

    // --- Send Waitlist Confirmation Email using Mailjet ---
    const mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    );
    const mailjetRequest = mailjet
      .post("send", { version: 'v3.1' })
      .request({
        "Messages": [
          {
            "From": {
              "Email": "hello@thys.co",
              "Name": "THYS"
            },
            "To": [ { "Email": email, "Name": name } ],
            "Subject": subject,
            "TextPart": textPart,
            "HTMLPart": htmlPart
          }
        ]
      });

    try {
        const result = await mailjetRequest;
        console.log('Mailjet Send API Response:', result.body);
    } catch (emailError) {
        console.error('Error sending Mailjet email:', emailError.statusCode, emailError.message);
        // Log only, don't cause function to fail if email sending fails
    }
    // --- End Send Waitlist Confirmation Email ---

    // Return success response to the frontend (indicates sheet operation was successful)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data successfully processed!' }),
    };

  } catch (error) {
    console.error('Error processing popup submission:', error);
    if (error.response && error.response.data) {
        console.error('Google API Error:', error.response.data.error);
    }
    // Return generic error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to process submission. Check function logs.' }),
    };
  }
};