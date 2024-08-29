

export function emailTemplate(email,message,name,phone) {
  return `<!DOCTYPE html>
  <html lang="en">
  <body style="padding: 0; max-width: 600px; background-color: white; font-family: 'Cairo', sans-serif; margin: 0 auto;">
      <div class="logo" style="text-align: center; padding: 20px 0;">
          <img
              src="https://tchatpro.com/email/logo2.png"
              alt="logo"
              width="150"
              height="50"
              style="filter: invert(1) brightness(10000%); object-fit: cover;"
          />
      </div>
      <main style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
          <div class="image" style="text-align: center; margin-bottom: 20px;">
              <img src="https://tchatpro.com/email/onboard1.png" alt="image" width="300" />
          </div>
          <div class="content" style="text-align: center;">
              <h1 style="color: black; font-size: 24px; margin: 0;">Help Center</h1>
              <p style="color: #707070; font-size: 18px; margin: 3px; line-height: 1.5;">
                  ${message}
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.2;">
                  <strong>UserName:</strong> ${name}
              </p>
              <p style="font-size: 16px; margin: 3px; line-height: 1.2;">
                  <strong>Email:</strong> ${email}
              </p>
              <p style="font-size: 16px; margin: 3px; line-height: 1.2;">
                  <strong>Phone Number:</strong> ${phone}
              </p> 
          </div>
      </main>
  </body>
  </html>`;
  

}