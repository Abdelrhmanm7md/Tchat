

export function emailTemplate(email,message,name,phone) {
    return `  <body style="padding: 0; max-width: 600px; background-color: white; font-family: 'Cairo', sans-serif; margin: 0 auto;">
    <!-- header  -->
      <div class="logo">
        <img
          src="./assets/images/logo2.png"
          alt="logo"
          width="150"
          height="50"
          style="filter: invert(1) brightness(10000%); object-fit: cover;"
        />
      </div>
    </header>
    <!-- main content  -->
    <main style="display: flex; align-items: center; justify-content: center;">
      <div class="image">
        <img src="./assets/images/onboard1.png" alt="image" width="300" />
      </div>
      <div class="content">
        <h1 style="color: black; font-size: 24px; margin: 0;">Help Center</h1>
        <p style="color: #707070; font-size: 18px; margin: 3px; line-height: 1.5;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel velit
          ac libero tincidunt faucibus. Donec vel mauris id sem finibus semper.
        </p>
        <p style="margin: 0; font-size: 16px; line-height: 1.2;">
          <strong>UserName:</strong>
          Boda
        </p>
        <p style="font-size: 16px; margin: 3px; line-height: 1.2;">
          <strong>Mail:</strong>
          boda@gmail.com
        </p>
        <p style="font-size: 16px; margin: 3px; line-height: 1.2 ;">
          <strong>Phone Number:</strong>
          +96555555555
        </p> 
      </div>
    </main>
  </body>`;


}