// Same conventions as welcomeTeamMemberEmail.ts — plain exported string
// (not a static asset) so it survives `tsc` into dist/, tokens replaced by
// utils/renderTemplate.ts.
export const resetPasswordEmailTemplate = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Reset your TTM password</title>
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
<body style="margin:0; padding:0; background-color:#EEF2FF;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    Reset your TTM password — this link expires in 1 hour.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#EEF2FF">
    <tr>
      <td align="center" class="email-canvas" style="padding: 48px 16px; background-image: linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 55%, #EDE9FE 100%); background-color:#EEF2FF;">

        <table role="presentation" width="448" cellpadding="0" cellspacing="0" class="email-card" style="width:448px; max-width:100%; background-color:#FFFFFF; border-radius:16px; border:1px solid rgba(0,0,0,0.05); box-shadow: 0 20px 25px -5px rgba(99,102,241,0.15), 0 8px 10px -6px rgba(99,102,241,0.1);">
          <tr>
            <td class="email-card-inner" style="padding: 32px 32px 0 32px;">

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

              <div style="text-align:center; padding-bottom:28px;">
                <h1 style="margin:0; font-size:24px; line-height:1.3; color:#111827; font-weight:700;">
                  Reset your password
                </h1>
                <p style="margin:4px 0 0 0; font-size:14px; color:#6B7280;">
                  This link expires in 1 hour
                </p>
              </div>

              <p style="margin:0; font-size:14px; line-height:1.7; color:#374151; text-align:left;">
                Hi {{recipientName}},
              </p>
              <p style="margin:12px 0 0 0; font-size:14px; line-height:1.7; color:#374151; text-align:left;">
                We received a request to reset your TTM password. Click the button below to choose a new one.
                If you didn't request this, you can safely ignore this email — your password won't change.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:8px; background-color:#4F46E5; box-shadow: 0 4px 6px -1px rgba(199,210,254,0.6);">
                          <a href="{{resetUrl}}" style="display:inline-block; padding:11px 28px; font-size:14px; font-weight:600; color:#FFFFFF; border-radius:8px;">
                            Reset password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:14px 0 0 0; font-size:12px; color:#9CA3AF; text-align:center;">
                Didn't request this? You can safely ignore this email.
              </p>

              <div style="height:1px; background-color:#F3F4F6; margin:28px 0 0 0; font-size:0; line-height:0;">&nbsp;</div>

            </td>
          </tr>

          <tr>
            <td class="email-card-inner" style="padding: 18px 32px 28px 32px;" align="center">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#9CA3AF;">
                This email was sent by TTM because a password reset was requested for your account.
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
