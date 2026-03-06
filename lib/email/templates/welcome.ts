export type WelcomeEmailData = {
    userName: string;
    appUrl: string;
};

export function renderWelcomeEmail(data: WelcomeEmailData): { html: string; text: string } {
    const { userName, appUrl } = data;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SC Orga Manager</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070d14; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070d14; padding: 40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0b1623; border: 1px solid rgba(14, 236, 255, 0.2); border-radius: 6px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b2a3a 0%, #071a28 100%); border-bottom: 1px solid rgba(14, 236, 255, 0.3); padding: 28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: rgba(14, 236, 255, 0.6);">SC ORGA MANAGER</span>
                    <br />
                    <span style="font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-weight: bold; color: #e0f0ff; letter-spacing: 1px; margin-top: 4px; display: block;">Command Hub // Access Granted</span>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background: linear-gradient(135deg, rgba(79,195,220,0.15), rgba(79,195,220,0.07)); border: 1px solid rgba(79,195,220,0.35); border-radius: 3px; padding: 5px 12px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(79,195,220,0.9); text-transform: uppercase; letter-spacing: 2px;">NEW PILOT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Scan line -->
          <tr>
            <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(79,195,220,0.5) 30%, rgba(79,195,220,0.8) 50%, rgba(79,195,220,0.5) 70%, transparent 100%);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 8px;">

              <p style="margin: 0 0 8px; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(79,195,220,0.6);">// INCOMING TRANSMISSION</p>
              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: bold; color: #e0f0ff; line-height: 1.3;">
                Welcome aboard, ${escapeHtml(userName)}.
              </h1>
              <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: rgba(224, 240, 255, 0.75);">
                Your account is active. SC Orga Manager is your command center for running a Star Citizen trading organisation — inventory, transactions, members, reporting, and more, all in one place.
              </p>

              <!-- First steps -->
              <p style="margin: 0 0 16px; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(79,195,220,0.6);">// FIRST STEPS</p>

              <!-- Step 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px; background: rgba(79,195,220,0.04); border: 1px solid rgba(79,195,220,0.12); border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="padding-right: 14px;">
                          <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: rgba(79,195,220,0.15); border: 1px solid rgba(79,195,220,0.3); font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(79,195,220,0.9);">1</span>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #e0f0ff;">Create or join an organisation</p>
                          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: rgba(224,240,255,0.55);">Head to the Command Hub and create your first org, or accept an invite from a commander to join an existing one.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px; background: rgba(79,195,220,0.04); border: 1px solid rgba(79,195,220,0.12); border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="padding-right: 14px;">
                          <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: rgba(79,195,220,0.15); border: 1px solid rgba(79,195,220,0.3); font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(79,195,220,0.9);">2</span>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #e0f0ff;">Set up your inventory</p>
                          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: rgba(224,240,255,0.55);">Add items from the SC Wiki directly in the Inventory page. Set buy/sell prices and stock thresholds. Admins can bulk-import hundreds of items at once via CSV.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px; background: rgba(79,195,220,0.04); border: 1px solid rgba(79,195,220,0.12); border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="padding-right: 14px;">
                          <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: rgba(79,195,220,0.15); border: 1px solid rgba(79,195,220,0.3); font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(79,195,220,0.9);">3</span>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #e0f0ff;">Connect your Discord server</p>
                          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: rgba(224,240,255,0.55);">Link SC Orga Manager to your Discord guild. Members can then request and confirm trades directly from Discord — no browser required during ops.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Step 4 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; background: rgba(79,195,220,0.04); border: 1px solid rgba(79,195,220,0.12); border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="padding-right: 14px;">
                          <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: rgba(79,195,220,0.15); border: 1px solid rgba(79,195,220,0.3); font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(79,195,220,0.9);">4</span>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #e0f0ff;">Invite your crew</p>
                          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: rgba(224,240,255,0.55);">Go to Members and generate a permanent invite link or send individual Discord invites. Assign roles — owner, admin, or member — to keep operations structured.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PRO hint -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; background: linear-gradient(135deg, rgba(240,165,0,0.06), rgba(240,165,0,0.03)); border: 1px solid rgba(240,165,0,0.25); border-radius: 4px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 6px; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(240,165,0,0.7);">// PRO HINT</p>
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: bold; color: #e0f0ff;">Take your org to the next level</p>
                    <p style="margin: 0 0 14px; font-size: 13px; line-height: 1.7; color: rgba(224,240,255,0.65);">
                      For just <strong style="color: rgba(240,165,0,0.9);">€4.99/month</strong> per organisation, PRO unlocks:
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                      <tr><td style="padding: 3px 0; font-size: 13px; color: rgba(224,240,255,0.65);"><span style="color: rgba(240,165,0,0.8); margin-right: 8px;">▸</span>CSV Bulk Import &amp; Export — manage hundreds of items at once</td></tr>
                      <tr><td style="padding: 3px 0; font-size: 13px; color: rgba(224,240,255,0.65);"><span style="color: rgba(240,165,0,0.8); margin-right: 8px;">▸</span>Google Sheets Sync — live inventory in your own spreadsheet</td></tr>
                      <tr><td style="padding: 3px 0; font-size: 13px; color: rgba(224,240,255,0.65);"><span style="color: rgba(240,165,0,0.8); margin-right: 8px;">▸</span>Weekly PDF Reports — auto-generated every Monday with KPIs &amp; trends</td></tr>
                      <tr><td style="padding: 3px 0; font-size: 13px; color: rgba(224,240,255,0.65);"><span style="color: rgba(240,165,0,0.8); margin-right: 8px;">▸</span>Exclusive Discord Role — PRO channels &amp; faster support</td></tr>
                    </table>
                    <a href="${appUrl}/terminal" style="display: inline-block; background: linear-gradient(135deg, rgba(240,165,0,0.18), rgba(240,165,0,0.08)); border: 1px solid rgba(240,165,0,0.4); border-radius: 3px; padding: 9px 20px; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(240,165,0,0.9); text-decoration: none;">
                      [ EXPLORE PRO ]
                    </a>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td>
                    <a href="${appUrl}/terminal" style="display: inline-block; background: linear-gradient(135deg, rgba(79,195,220,0.15), rgba(79,195,220,0.08)); border: 1px solid rgba(79,195,220,0.5); border-radius: 3px; padding: 12px 28px; font-family: 'Courier New', Courier, monospace; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: rgba(79,195,220,0.9); text-decoration: none;">
                      [ ENTER COMMAND HUB ]
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 36px 24px; border-top: 1px solid rgba(14, 236, 255, 0.1);">
              <p style="margin: 0 0 6px; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: rgba(224, 240, 255, 0.25); line-height: 1.6;">
                You're receiving this because you created an account on SC Orga Manager.
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

      </td>
    </tr>
  </table>

</body>
</html>`;

    const text = `
SC ORGA MANAGER — ACCESS GRANTED
==================================

Welcome aboard, ${userName}!

Your account is active. SC Orga Manager is your command center for running a Star Citizen trading organisation.

FIRST STEPS
-----------
1. Create or join an organisation
   Head to the Command Hub and create your first org, or accept an invite to join an existing one.

2. Set up your inventory
   Add items from the SC Wiki in the Inventory page. Set buy/sell prices and stock thresholds.

3. Connect your Discord server
   Link SC Orga Manager to your Discord guild so members can manage trades directly from Discord.

4. Invite your crew
   Go to Members and generate a permanent invite link or send individual Discord invites.

PRO HINT
--------
For just €4.99/month per organisation, PRO unlocks:
  - CSV Bulk Import & Export — manage hundreds of items at once
  - Google Sheets Sync — live inventory in your own spreadsheet
  - Weekly PDF Reports — auto-generated every Monday with KPIs & trends
  - Exclusive Discord Role — PRO channels & faster support

Explore PRO: ${appUrl}/terminal

---
Enter Command Hub: ${appUrl}/terminal

You're receiving this because you created an account on SC Orga Manager.
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
