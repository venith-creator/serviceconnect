import { sendMail } from './utils/Email.js'

sendMail('patrickaghidi222005@gmail.com', 'Test Mail', 'Hello there!', '<p>Hello there!</p>')
    .then(() => console.log('Test email sent successfully'))