import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

export default NextAuth({
  providers: [
    Providers.Email({
      server: process.env.NEXTAUTH_EMAIL_SERVER,
      from: process.env.NEXTAUTH_EMAIL_FROM,
      sendVerificationRequest: ({
        identifier: email,
        url,
        baseUrl,
        provider,
      }) => {
        return new Promise((resolve, reject) => {
          const { server, from } = provider;
          // strip protocol from URL and use domain as site name
          const site = baseUrl.replace(/^https?:\/\//, '');

          nodemailer.createTransport(server).sendMail(
            {
              to: email,
              from,
              subject: `Sign in to Admin Dashboard [${format(
                new Date(),
                'iii MMM dd yyyy HH:mm:ss'
              )}]`,
              text: text({ url, site }),
              html: html({ url }),
            },
            error => {
              if (error) {
                console.error('SEND_VERIFICATION_EMAIL_ERROR', email, error);
                return reject(new Error(error.message));
              }
              return resolve();
            }
          );
        });
      },
    }),
  ],
  database: process.env.NEXTAUTH_DATABASE_URL,
  callbacks: {
    async signIn(user) {
      const allowedEmailAccounts = [
        'seanhasenstein@gmail.com',
        'nick@macaport.com',
        'joe@macaport.com',
        'ally@macaport.com',
        'anne@macaport.com',
      ];
      if (user.email && allowedEmailAccounts.includes(user.email)) {
        return true;
      } else {
        return '/unauthorized';
      }
    },
    async session(session, userOrToken) {
      return {
        ...session,
        user: {
          ...session.user,
          id: userOrToken.id as string,
        },
      };
    },
  },
  pages: {
    signIn: '/login',
    error: '/authentication-error',
    verifyRequest: '/verify-login',
  },
});

// Email HTML body
const html = ({ url }: { url: string }) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Macaport Admin Dashboard Sign-in Link</title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <style type="text/css">
        /* CLIENT_SPECIFIC STYLES */
        body,
        table,
        td,
        a {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
  
        /* RESET STYLES */
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        table {
          border-collapse: collapse !important;
        }
        body {
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
  
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
  
        /* GMAIL BLUE LINKS */
        u + #body a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
  
        /* SAMSUNG MAIL BLUE LINKS */
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
  
        /* Universal styles for links and stuff */
  
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .mobile {
            padding: 0 !important;
            width: 100% !important;
          }
  
          .mobile-padding {
            padding: 0 24px !important;
          }
        }
  
        @media screen and (max-width: 500px) {
          .mobile-full-width {
            width: 100% !important;
          }
  
          .item-title {
            padding: 14px 0 0 !important;
            font-size: 12px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.25px !important;
            font-weight: bold !important;
          }
        }
      </style>
    </head>
    <body
      id="body"
      style="
        margin: 0 !important;
        padding: 0 !important;
        background-color: #edf0f3;
      "
    >
      <table
        border="0"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        width="100%"
      >
        <tr>
          <td align="center" style="padding: 24px 0" class="mobile">
            <table
              class="mobile"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              width="600"
              bgcolor="#ffffff"
              style="
                background-color: #ffffff;
                color: #242a37;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                  Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
                  sans-serif;
                font-size: 18px;
                line-height: 36px;
                margin: 0;
                padding: 0;
              "
            >
              <tr>
                <td style="padding: 0 64px" class="mobile-padding">
                  <table
                    class="mobile"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    width="100%"
                  >
                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding: 40px 0 8px">
                        <img
                          src="https://res.cloudinary.com/dra3wumrv/image/upload/v1621535049/macaport/logo-main-bg.png"
                          alt="Macaport logo with mountains"
                          width="80"
                          style="display: block; margin: 0 auto"
                        />
                      </td>
                    </tr>
  
                    <!-- Email Title -->
                    <tr>
                      <td style="padding: 20px 0; line-height: 1">
                        <h1
                          style="
                            margin: 0;
                            padding: 0;
                            font-size: 20px;
                            font-weight: 500;
                            color: #232c35;
                            text-align: center;
                          "
                        >
                          Macaport Admin Sign-in Link
                        </h1>
                      </td>
                    </tr>
  
                    <!-- Explanation paragraph -->
                    <tr>
                      <td>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          width="100%"
                        >
                          <tr>
                            <td
                              style="
                                padding: 0;
                                font-size: 16px;
                                color: #5a7187;
                                line-height: 1.5;
                                text-align: center;
                              "
                            >
                              <p style="margin: 0; padding: 0">
                                Here is the sign-in link that you requested for the Macaport Admin Dashboard.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
  
                    <!-- Sign in button -->
                    <tr>
                      <td>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          width="100%"
                        >
                          <tr>
                            <td
                              style="
                                padding: 24px 0;
                                font-size: 16px;
                                color: #5a7187;
                                line-height: 1.5;
                              "
                              align="center"
                            >
                              <div>
                                <!--[if mso]>
                                  <v:roundrect
                                    xmlns:v="urn:schemas-microsoft-com:vml"
                                    xmlns:w="urn:schemas-microsoft-com:office:word"
                                    href="${url}"
                                    style="
                                      height: 40px;
                                      v-text-anchor: middle;
                                      width: 200px;
                                    "
                                    arcsize="15%"
                                    strokecolor="#047857"
                                    fillcolor="#059669"
                                  >
                                    <w:anchorlock />
                                    <center
                                      style="
                                        color: #ffffff;
                                        font-family: -apple-system,
                                          BlinkMacSystemFont, 'Segoe UI', Roboto,
                                          Oxygen, Ubuntu, Cantarell, 'Open Sans',
                                          'Helvetica Neue', sans-serif;
                                        font-size: 13px;
                                        font-weight: bold;
                                      "
                                    >
                                      Click here to sign in
                                    </center>
                                  </v:roundrect> <!
                                [endif]--><a
                                  href="${url}"
                                  style="
                                    background-color: #059669;
                                    border: 1px solid #047857;
                                    border-radius: 6px;
                                    color: #ffffff;
                                    display: inline-block;
                                    font-family: -apple-system, BlinkMacSystemFont,
                                      'Segoe UI', Roboto, Oxygen, Ubuntu,
                                      Cantarell, 'Open Sans', 'Helvetica Neue',
                                      sans-serif;
                                    font-size: 13px;
                                    font-weight: bold;
                                    line-height: 40px;
                                    text-align: center;
                                    text-decoration: none;
                                    width: 200px;
                                    -webkit-text-size-adjust: none;
                                    mso-hide: all;
                                  "
                                  >Click here to sign in</a
                                >
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
  
                    <!-- Explanation paragraph -->
                    <tr>
                      <td>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          width="100%"
                        >
                          <tr>
                            <td
                              style="
                                padding: 24px 0;
                                font-size: 16px;
                                color: #5a7187;
                                line-height: 1.5;
                                border-top: 1px solid #e6ebf1;
                              "
                            >
                              <p style="margin: 0; padding: 0">
                                This link expires in 24 hours and can only be used
                                once. After that you will need to
                                <a
                                  href="https://dashboard.macaport.com/login"
                                  style="
                                    color: #2563eb;
                                    text-decoration: underline;
                                  "
                                  >request another link</a
                                >.
                              </p>
                              <p style="margin: 0; padding: 16px 0">
                                If you did not request this email you can safely
                                ignore it.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

// Email text body - fallback for email clients that don't render HTML
const text = ({ url, site }: { url: string; site: string }) =>
  `Sign in to ${site}\n${url}\n\n`;
