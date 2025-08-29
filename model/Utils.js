const nodemailer = require('nodemailer');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    service: 'gmail',
    auth: {
        user: 'donotreply@drclearaligners.com',
        pass: 'skwqqfbaygkwuixs',
    },
});

class Utils {
    static async new_case_notification(caseid) {
        try {
            const loginUrl = process.env.BASE_URL;
            const htmlTemplate = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>33Labs New Case Notification</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                            background-color: #f8f8f8 !important;
                        }
                        .email-container {
                            max-width: 684px;
                            margin: 0 auto;
                            padding: 33px 36px 32px 36px;
                            background: #FFFFFF;
                            overflow: hidden;
                        }
                        .header {
                            text-align: center;
                        }
                        .logo {
                            color: #338877;
                            font-size: 28px;
                            font-weight: bold;
                            margin: 0;
                        }
                        .icon-section {
                            text-align: center;
                            margin-top: 32px;
                            margin-bottom: 24px;
                        }
                        .document-icon {
                            position: relative;
                            display: inline-block;
                            width: 72px;
                            height: 72px;
                        }
                        .content {
                            text-align: center;
                        }
                        .headline {
                            color: #333333;
                            font-size: 20px;
                            font-weight: 700;
                            line-height: 24px;
                            letter-spacing: 0.4px;
                            margin-bottom: 8px;
                        }
                        .subheadline {
                            color: #767676;
                            font-size: 16px;
                            font-weight: 500;
                            line-height: 20px;
                            letter-spacing: 0.32px;
                            margin-bottom: 48px;
                        }
                        .cta-button {
                            display: inline-block;
                            border-radius: 8px;
                            background: #003366;
                            color: white !important;
                            text-decoration: none;
                            padding: 8px 16px;
                            color: #FFFFFF;
                            font-size: 14px;
                            font-weight: 700;
                            line-height: 20px;
                            letter-spacing: 0.28px;
                            transition: background-color 0.3s ease;
                        }
                        .cta-button:hover {
                            background-color: #003366;
                        }
                        .footer {
                            text-align: center;
                            max-width: 684px;
                            margin: 20px auto;
                            color: #A1A1A1;
                            font-size: 12px;
                            font-weight: 500;
                            line-height: 16px;
                            letter-spacing: 0.24px;
                        }
                        .footer a {
                            color: #3483E4;
                            font-size: 12px;
                            font-weight: 700;
                            line-height: 16px;
                            letter-spacing: 0.24px;
                            text-decoration: none;
                        }
                        .footer a:hover {
                            color: #3483E4;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1 class="logo"><img src="${loginUrl}/assets/images/email_logo.png" alt="33LABS Logo" class="logo" width="72px" height="19px"></h1>
                        </div>
                        
                        <div class="icon-section">
                            <div class="document-icon">
                                <img src="${loginUrl}/assets/images/email-new-case-icon.svg" alt="New Case Icon" class="new-case-icon" width="72px" height="72px">
                            </div>
                        </div>
                        
                        <div class="content">
                            <h2 class="headline">You have 1 new case.</h2>
                            <p class="subheadline">Login to view the case details and proceed to next process.</p>
                            <a href="${loginUrl}/cases/${caseid}" class="cta-button">Check Now</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        The email message was auto-generated. Please do not respond. If you have any questions while using our platform, our dedicated support team is here to assist you. Please feel free to reach out to us at <a href="mailto:hello@email.com">hello@email.com</a>.
                    </div>
                </body>
                </html>`;

            const mailOptions = {
                from: 'donotreply@drclearaligners.com',
                to: 'dickson.it@drclearaligners.com, hazim.it@drclearaligners.com',
                // bcc: 'larokrss1@gmail.com',
                subject: '33Labs New Case',
                html: htmlTemplate,
                text: 'New Case Submitted: ' + caseid + '\n\nYou have 1 new case. Login to view the case details and proceed to next process.',
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Email sent successfully:', info.messageId);
                }
            });
        } catch (err) {
            console.error(err);
            // return sendToDiscord('Sendmail error(forgotpassword):' + err);
        }
    }
    
    static async insert_upload_stl_case_to_spreadsheet(caseid) {
        try {
            doc = new GoogleSpreadsheet('1QqjF6GXml5_TTi-bBo-jRMpoW9FlmKKuKBbGjFw7EzE');

            await doc.useServiceAccountAuth({
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY,
            });

            await doc.loadInfo(); // loads document properties and worksheets
            const sheet = doc.sheetsByTitle['33Lab Express'];
            const larryRow = await sheet.addRow({
                'Timestamp': formatDate('', 1),
                'Order ID': '',
                'Country': req.session.mysqlid,
                'Brand': formatdate(),
                'Submitter' : idealtreatment,
                'Patient Name' : teethtype,
                '33Lab Case ID' : reason,
                'Product': name1,
                'Documents' : phone
            });
        } catch (err) {
            console.error(err)
            errorDetails.id = req.session.mysqlid
            errorDetails.errMessage = err
            // dcerror(errorDetails)
            data = {
                name: '',
                space: '',
                id: req.session.mysqlid,
                date: formatdate(),
                idealtreatment,
                teethtype,
                reason,
                firstname: name1,
                phone,
                email,
                message,
                language: form_lang,
                kol,
                social_media: sm,
            }
            // insertDiscordErrorData('dca', '1nAERomUuddXupzX_sC7GdCNZgzc56Y32Gqvgc4dss5w', 'Web AUS', leedsheetname, err, data, 'none')
        }
    }
}

function formatDate(date, type) {
    var d;
    if (date == undefined || date == 'undefined' || date == '') {
        d = new Date()
    } else {
        d = new Date(date)
    }
    var month = '' + (d.getMonth() + 1)
    var day = '' + d.getDate()
    var year = d.getFullYear();
    var hour = d.getHours();
    var min = d.getMinutes();
    var sec = d.getSeconds();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    if (type == 1) {
        return `${day}/${month}/${year} ${(hour)}:${min}:${sec}`
    } else {
        return `${day}/${month}/${year}`
    }
}

async function checkOrderId(caseid, connection) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const formattedDate = `${day}${month}${year}`;

    await connection.query(
        `INSERT INTO order_counter (date_key, counter)
        VALUES (${formattedDate}, 1)
        ON DUPLICATE KEY UPDATE counter = counter + 1;`
    );

    const [raw] = await connection.query(`SELECT counter FROM order_counter WHERE date_key = ? LIMIT 1 FOR UPDATE;`, [formattedDate]);

    const orderIdNumberPart = raw[0].counter;

    return `${String(formattedDate).padStart(4, '0')}-${String(orderIdNumberPart).padStart(4, '0')}`;
}

module.exports = Utils;
