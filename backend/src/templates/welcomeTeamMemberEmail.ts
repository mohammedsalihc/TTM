// Kept as a plain exported string (not a static .html asset) so it survives
// `tsc` compilation into dist/ without needing a separate asset-copy step.
// Tokens are replaced by utils/renderTemplate.ts. Shared by both employee
// and manager invites — {{designation}} carries whatever role phrase the
// caller wants ("Frontend Developer", "a Manager", etc.).
export const welcomeTeamMemberEmailTemplate = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Welcome to TTM</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<style>
  table { border-collapse: collapse; }
</style>
<![endif]-->
<style>
  /* Progressive enhancement only — every rule that matters is also inlined,
     since Gmail and several clients strip this block entirely. */
  body, table, td, a { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  img { border: 0; line-height: 100%; vertical-align: middle; }
  a { text-decoration: none; }

  @media (max-width: 600px) {
    .email-canvas { padding: 24px 12px !important; }
    .email-card { width: 100% !important; }
    .email-card-inner { padding-left: 28px !important; padding-right: 28px !important; }
  }
</style>
</head>
<!-- Background approximates the app's \`bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100\`
     (Login/Register page background). Outlook desktop ignores CSS gradients, hence the
     solid indigo-50 fallback on <body>/bgcolor below. -->
<body style="margin:0; padding:0; background-color:#EEF2FF;">
  <!-- Preheader: the snippet shown next to the subject line in the inbox list. -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    You've been added to {{businessName}} on TTM — your login details are inside.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#EEF2FF">
    <tr>
      <td align="center" class="email-canvas" style="padding: 48px 16px; background-image: linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 55%, #EDE9FE 100%); background-color:#EEF2FF;">

        <table role="presentation" width="448" cellpadding="0" cellspacing="0" class="email-card" style="width:448px; max-width:100%; background-color:#FFFFFF; border-radius:16px; border:1px solid rgba(0,0,0,0.05); box-shadow: 0 20px 25px -5px rgba(99,102,241,0.15), 0 8px 10px -6px rgba(99,102,241,0.1);">
          <tr>
            <td class="email-card-inner" style="padding: 32px 32px 0 32px;">

              <!-- Logo — same mark + wordmark as Logo.tsx -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right:10px;">
                          <!--[if mso]>
                          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                          <td width="38" height="38" bgcolor="#4F46E5" style="width:38px; height:38px; border-radius:11px; font-size:16px; font-weight:800; color:#ffffff; text-align:center;" valign="middle">TTM</td>
                          </tr></table>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;">
                            <rect width="38" height="38" rx="11" fill="#4F46E5" />
                            <rect x="9" y="9" width="7" height="20" rx="2" fill="white" fill-opacity="0.9" />
                            <rect x="19" y="15" width="7" height="14" rx="2" fill="white" fill-opacity="0.65" />
                          </svg>
                          <!--<![endif]-->
                        </td>
                        <td valign="middle">
                          <span style="font-size:20px; font-weight:700; letter-spacing:-0.02em; color:#4F46E5;">TTM</span>
                        </td>
                      </tr>
                    </table>
                    <div style="font-size:12px; color:#6B7280; margin-top:4px;">Team Task Management</div>
                  </td>
                </tr>
              </table>

              <!-- Headline, matching Login.tsx's h1 / subtitle pattern -->
              <div style="text-align:center; padding-bottom:28px;">
                <h1 style="margin:0; font-size:24px; line-height:1.3; color:#111827; font-weight:700;">
                  Welcome to {{businessName}}
                </h1>
                <p style="margin:4px 0 0 0; font-size:14px; color:#6B7280;">
                  Your account has been created
                </p>
              </div>

              <!-- Body copy -->
              <p style="margin:0; font-size:14px; line-height:1.7; color:#374151; text-align:left;">
                Hi {{recipientName}},
              </p>
              <p style="margin:12px 0 0 0; font-size:14px; line-height:1.7; color:#374151; text-align:left;">
                You've been added as <strong style="color:#111827;">{{designation}}</strong> at
                <strong style="color:#111827;">{{businessName}}</strong> on TTM — the place your team tracks
                projects and tasks together. Here are your login details:
              </p>

              <!-- Credentials panel, same border/bg convention as the app's tables/cards -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; background-color:#F9FAFB; border:1px solid #F3F4F6; border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:11px; font-weight:600; letter-spacing:0.05em; color:#6B7280; text-transform:uppercase; padding-bottom:4px;">
                          Email
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:14px; color:#111827; font-weight:600; padding-bottom:14px; word-break:break-all;">
                          {{email}}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:11px; font-weight:600; letter-spacing:0.05em; color:#6B7280; text-transform:uppercase; padding-bottom:4px;">
                          Password
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:14px; color:#111827; font-weight:600; font-family:'SF Mono', Consolas, Menlo, monospace;">
                          {{password}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button — same classes as Login/Register's submit button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:8px; background-color:#4F46E5; box-shadow: 0 4px 6px -1px rgba(199,210,254,0.6);">
                          <a href="{{loginUrl}}" style="display:inline-block; padding:11px 28px; font-size:14px; font-weight:600; color:#FFFFFF; border-radius:8px;">
                            Sign in
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:14px 0 0 0; font-size:12px; color:#9CA3AF; text-align:center;">
                We recommend changing your password after your first login.
              </p>

              <!-- Divider -->
              <div style="height:1px; background-color:#F3F4F6; margin:28px 0 0 0; font-size:0; line-height:0;">&nbsp;</div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-card-inner" style="padding: 18px 32px 28px 32px;" align="center">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#9CA3AF;">
                This invitation was sent by {{businessName}} via TTM.<br />
                If you weren't expecting this, you can safely ignore this email.
              </p>
              <p style="margin:12px 0 0 0; font-size:11px; color:#D1D5DB;">
                &copy; {{currentYear}} TTM &middot; Team Task Management
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
