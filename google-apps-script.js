/**
 * Google Apps Script for Ermias & Bethelhem Wedding Invitation
 * 
 * ⚠️ IMPORTANT INSTRUCTIONS TO SYNC WISHES & RSVP:
 * 1. Open your Google Sheet (where RSVPs are collected).
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Select all and paste this exact script into the editor.
 * 4. Click the "Save" icon (Floppy disk).
 * 5. Click "Deploy" > "Manage deployments" (top right):
 *    - Click the Pencil (Edit) icon next to your active Web App deployment.
 *    - Under "Version", select "New version" from the dropdown. 
 *      (⚠️ CRITICAL: If you don't select "New version", Google will NOT activate doGet and wishes won't sync!)
 *    - Ensure "Execute as" is set to "Me".
 *    - Ensure "Who has access" is set to "Anyone".
 *    - Click the blue "Deploy" button.
 * 6. That's it! Your website will now instantly read all guest wishes and sync with Excel!
 */

// GET endpoint: returns all guest wishes to the wedding website
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet() || ss.getSheets()[0];
    const rows = sheet.getDataRange().getValues();

    if (!rows || rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Row 1 is usually header names
    const headers = rows[0].map(function(h) { return String(h || '').trim().toLowerCase(); });
    
    // Find column indexes flexibly
    let nameIdx = headers.findIndex(function(h) { return h.includes('name') || h.includes('ስም'); });
    let messageIdx = headers.findIndex(function(h) { return h.includes('message') || h.includes('መልእክት') || h.includes('wish'); });
    let dateIdx = headers.findIndex(function(h) { return h.includes('date') || h.includes('time') || h.includes('ቀን') || h.includes('timestamp'); });

    // Fallbacks if headers differ
    if (nameIdx === -1) nameIdx = 0; // Column A
    if (messageIdx === -1) messageIdx = 4; // Column E (typical for name, phone, attending, guests, message)
    if (dateIdx === -1) dateIdx = 5; // Column F

    const wishes = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row[nameIdx] || '').trim();
      const message = String(row[messageIdx] || '').trim();
      const dateVal = row[dateIdx];
      let date = '';
      if (dateVal instanceof Date) {
        date = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), 'MMM dd, yyyy');
      } else if (dateVal) {
        date = String(dateVal).trim();
      }

      // Only include rows where guest left a message
      if (message && message.length > 0) {
        wishes.push({
          id: i,
          name: name || 'Guest',
          message: message,
          date: date
        });
      }
    }

    // Return newest wishes first
    wishes.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: wishes
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// POST endpoint: receives RSVP submissions and appends to sheet
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet() || ss.getSheets()[0];
    const data = JSON.parse(e.postData.contents);

    // Make sure header exists if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Full Name', 'Phone Number', 'Attending', 'Guests', 'Message', 'Submission Date']);
    }

    sheet.appendRow([
      data.name || '',
      data.phone || '',
      data.attending || '',
      data.guests || 1,
      data.message || '',
      new Date()
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
