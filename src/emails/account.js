const sgMail = require('@sendgrid/mail')
const sendgridKey = process.env.SENDGRID_API_KEY
const fromAddress = process.env.FROM_ADDRESS

sgMail.setApiKey(sendgridKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromAddress,
        subject: 'Welcome to the task app!',
        text: `Welcome to the task app, ${name}. Let me know how you get on!`
    })
}

const sendAccountCloseEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromAddress,
        subject: 'Sorry to see you go',
        text: `We hate to see you leave ${name}, but we'd be ever so greatful if you took
         a moment to tell us what we could do better.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendAccountCloseEmail
}