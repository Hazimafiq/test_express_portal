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
            const mailOptions = {
                from: 'donotreply@drclearaligners.com',
                to: 'dickson.it@drclearaligners.com',
                // bcc: 'larokrss1@gmail.com',
                subject: '33Labs New Case',
                text: 'New Case Submitted:' + caseid,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                } else {
                }
            });
        } catch (err) {
            console.error(error);
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
