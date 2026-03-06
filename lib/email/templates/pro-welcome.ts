export type ProWelcomeEmailData = {
    orgName: string;
    ownerName: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    amount?: string;
    currency?: string;
    invoiceUrl?: string;
    periodEnd?: string;
    appUrl: string;
    billingSettingsUrl: string;
};

export function renderProWelcomeEmail(data: ProWelcomeEmailData): { html: string; text: string } {
    const {
        orgName,
        ownerName,
        invoiceNumber,
        invoiceDate,
        amount,
        currency,
        invoiceUrl,
        periodEnd,
        appUrl,
        billingSettingsUrl,
    } = data;

    const formattedAmount =
        amount && currency
            ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currency.toUpperCase(),
              }).format(parseFloat(amount) / 100)
            : null;

    const invoiceSection =
        invoiceNumber && formattedAmount
            ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0; border: 1px solid rgba(14, 236, 255, 0.25); border-radius: 4px; overflow: hidden;">
        <tr>
          <td style="background: rgba(14, 236, 255, 0.06); padding: 16px 24px; border-bottom: 1px solid rgba(14, 236, 255, 0.15);">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(14, 236, 255, 0.7);">// PAYMENT RECEIPT</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: rgba(224, 240, 255, 0.55); width: 180px;">Invoice No.</td>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #e0f0ff;">${invoiceNumber}</td>
              </tr>
              ${
                  invoiceDate
                      ? `<tr>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: rgba(224, 240, 255, 0.55);">Date</td>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #e0f0ff;">${invoiceDate}</td>
              </tr>`
                      : ""
              }
              <tr>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: rgba(224, 240, 255, 0.55);">Description</td>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #e0f0ff;">SC Orga Manager – PRO Plan (Monthly)</td>
              </tr>
              ${
                  periodEnd
                      ? `<tr>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: rgba(224, 240, 255, 0.55);">Access Until</td>
                <td style="padding: 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #e0f0ff;">${periodEnd}</td>
              </tr>`
                      : ""
              }
              <tr>
                <td colspan="2" style="padding-top: 16px; border-top: 1px solid rgba(14, 236, 255, 0.15);">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family: 'Courier New', Courier, monospace; font-size: 13px; color: rgba(224, 240, 255, 0.55);">Total Paid</td>
                      <td align="right" style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: bold; color: #0eecff;">${formattedAmount}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${
            invoiceUrl
                ? `<tr>
          <td style="padding: 12px 24px 16px; border-top: 1px solid rgba(14, 236, 255, 0.10);">
            <a href="${invoiceUrl}" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: rgba(14, 236, 255, 0.7); text-decoration: none;">
              [ VIEW FULL INVOICE ↗ ]
            </a>
          </td>
        </tr>`
                : ""
        }
      </table>`
            : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SC Orga Manager PRO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070d14; font-family: Arial, Helvetica, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070d14; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0b1623; border: 1px solid rgba(14, 236, 255, 0.2); border-radius: 6px; overflow: hidden;">

          <!-- Header bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b2a3a 0%, #071a28 100%); border-bottom: 1px solid rgba(14, 236, 255, 0.3); padding: 28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: rgba(14, 236, 255, 0.6);">SC ORGA MANAGER</span>
                    <br />
                    <span style="font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-weight: bold; color: #e0f0ff; letter-spacing: 1px; margin-top: 4px; display: block;">Command Hub // PRO</span>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background: linear-gradient(135deg, #0eecff22, #0eecff11); border: 1px solid rgba(14, 236, 255, 0.4); border-radius: 3px; padding: 5px 12px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #0eecff; text-transform: uppercase; letter-spacing: 2px;">PRO ACTIVE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Decorative scan line -->
          <tr>
            <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(14, 236, 255, 0.5) 30%, rgba(14, 236, 255, 0.8) 50%, rgba(14, 236, 255, 0.5) 70%, transparent 100%);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 8px;">

              <!-- Greeting -->
              <p style="margin: 0 0 8px; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(14, 236, 255, 0.6);">// INCOMING TRANSMISSION</p>
              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: bold; color: #e0f0ff; line-height: 1.3;">
                Welcome aboard, ${escapeHtml(ownerName)}.
              </h1>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: rgba(224, 240, 255, 0.75);">
                Your organization <strong style="color: #e0f0ff;">${escapeHtml(orgName)}</strong> has been upgraded to <strong style="color: #0eecff;">SC Orga Manager PRO</strong>.
                You now have access to the full command suite — advanced reporting, extended analytics, and priority features as they ship.
              </p>
              <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: rgba(224, 240, 255, 0.75);">
                Your support keeps this project flying. We're glad to have you in the PRO squadron.
              </p>

              <!-- What's unlocked -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; background: rgba(14, 236, 255, 0.04); border: 1px solid rgba(14, 236, 255, 0.15); border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 24px; border-bottom: 1px solid rgba(14, 236, 255, 0.10);">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(14, 236, 255, 0.6);">// PRO FEATURES UNLOCKED</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: rgba(224, 240, 255, 0.8);">
                          <span style="color: #0eecff; margin-right: 10px;">▸</span> Automated weekly performance reports
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: rgba(224, 240, 255, 0.8);">
                          <span style="color: #0eecff; margin-right: 10px;">▸</span> PDF export with org analytics
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: rgba(224, 240, 255, 0.8);">
                          <span style="color: #0eecff; margin-right: 10px;">▸</span> Historical KPI trend tracking
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: rgba(224, 240, 255, 0.8);">
                          <span style="color: #0eecff; margin-right: 10px;">▸</span> Priority access to new PRO features
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: rgba(224, 240, 255, 0.8);">
                          <span style="color: #0eecff; margin-right: 10px;">▸</span> Exclusive Discord Role — PRO channels, faster support &amp; direct help
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Invoice -->
              ${invoiceSection}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 8px 0 36px;">
                <tr>
                  <td>
                    <a href="${appUrl}/terminal" style="display: inline-block; background: linear-gradient(135deg, rgba(14, 236, 255, 0.15), rgba(14, 236, 255, 0.08)); border: 1px solid rgba(14, 236, 255, 0.5); border-radius: 3px; padding: 12px 28px; font-family: 'Courier New', Courier, monospace; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #0eecff; text-decoration: none;">
                      [ ENTER COMMAND HUB ]
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Subscription management -->
          <tr>
            <td style="padding: 20px 36px; border-top: 1px solid rgba(14, 236, 255, 0.15); background: rgba(14, 236, 255, 0.03);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: rgba(224, 240, 255, 0.5); line-height: 1.6;">
                      You can cancel your subscription at any time — no questions asked.
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding-left: 16px; white-space: nowrap;">
                    <a href="${billingSettingsUrl}" style="display: inline-block; border: 1px solid rgba(14, 236, 255, 0.25); border-radius: 3px; padding: 7px 16px; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(14, 236, 255, 0.6); text-decoration: none;">
                      Manage Subscription
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 36px 24px; border-top: 1px solid rgba(14, 236, 255, 0.08);">
              <p style="margin: 0 0 6px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(224, 240, 255, 0.25); line-height: 1.6;">
                You're receiving this because you activated PRO for <strong>${escapeHtml(orgName)}</strong> on SC Orga Manager.
              </p>
              <p style="margin: 0 0 10px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(224, 240, 255, 0.2); line-height: 1.6;">
                This is an automated message — please do not reply to this email. This address is not monitored and replies will not be received.
              </p>
              <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(14, 236, 255, 0.2);">
                SC ORGA MANAGER // END TRANSMISSION
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;

    const text = `
SC ORGA MANAGER – PRO ACTIVATED
================================

Welcome, ${ownerName}!

Your organization "${orgName}" has been upgraded to SC Orga Manager PRO.

PRO FEATURES UNLOCKED:
  - Automated weekly performance reports
  - PDF export with org analytics
  - Historical KPI trend tracking
  - Priority access to new PRO features
  - Exclusive Discord Role — PRO channels, faster support & direct help

${
    invoiceNumber && formattedAmount
        ? `PAYMENT RECEIPT
---------------
Invoice:      ${invoiceNumber}
${invoiceDate ? `Date:         ${invoiceDate}\n` : ""}Description:  SC Orga Manager – PRO Plan (Monthly)
${periodEnd ? `Access Until: ${periodEnd}\n` : ""}Total Paid:   ${formattedAmount}
${invoiceUrl ? `\nView Invoice: ${invoiceUrl}\n` : ""}`
        : ""
}
Access your org: ${appUrl}/terminal

---
You can cancel your subscription at any time:
${billingSettingsUrl}

You're receiving this because you activated PRO for "${orgName}" on SC Orga Manager.
This is an automated message — please do not reply to this email.
`.trim();

    return { html, text };
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
