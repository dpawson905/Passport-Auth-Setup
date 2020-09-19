# Auth Starter
## Requirements
1. This project uses MongoDb(Mongoose), Express, Cloudinary, SendGrid and the template engine is Pug.
2. For authentication is implemented using passport and stores local accounts.
## Setup
* Create a .env file and input the following...
    - NODE_ENV=
    - DB_URL=
    - COOKIE_SECRET=
    - CLOUDINARY_SECRET=
    - CLOUD_NAME=
    - CLOUDINARY_API_KEY=
    - CLOUDINARY_URL=CLOUDINARY_URL=
    - SENDGRID_API_KEY=
    - EMAIL_FROM=
* run `npm i` to install the dependencies

## Running the app
* For Mac/Linux users run the app with `npm run dev`
* For Windows users run the app with `npm run dev-win`

## Emails
In utils/email.js is where all of the setup is. There is an email class that has been set up along with methods for sending the email. It uses pug templates in views/emails. As it is set up now there is an email handler for:
* Welcome Email with verify link.
* Token resend for email verification
* Password change(forgot) request
* Send when a user resets their password

To setup a new method for sending an email do the following:
* In utils/email create a new method - 
    - ```
        exampleMethod(propsIfNeeded) {
            await this.send(NAMEOFPUGFILE in views/email, SUBJECT(with props if used)
        }
    - Then in your controller file make sure to require it `const Email = require("../utils/email");` and then within your code before redirecting or rendering a page you can call `await new Email(props).method()`.

### Extra
I created a npm package called create-admin-cli that makes creating the initial admin user easier and it bypasses email verification. It's simple to use... Type `create-admin-cli` in the terminal and follow the instructions.