const pool = require('../utils/mysql');
const CustomError = require('../errors/CustomError');
const STATUS = process.env.STATUS;
const AWS = require('aws-sdk');

//get signedurl domain name
let domainname = ''
if (STATUS == 'production') {
    domainname = process.env.productionsignedurl
} else if (STATUS == 'local') {
    domainname = process.env.localsignedurl
} else {
    domainname = process.env.devsignedurl
}

var s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET_NAME,
    region: process.env.AWS_REGION
})

class File {
    static async get_file({ caseid, fileid }) {
        const get_limit_timeurl_query = 'SELECT case_id, file_id, expired_time, file_name, file_url, getcount,limit_time_url FROM file_upload_table WHERE case_id = ? and file_id = ?';
        const details_values = [caseid, fileid];
        const [limit_timeurl] = await pool.query(get_limit_timeurl_query, details_values);

        if (limit_timeurl.length === 0) {
            throw new CustomError('No File Found', 404);
        }

        let expiredtime = ''
        let storesignurl = ''
        let check_pdf = ''
        if (limit_timeurl[0].expired_time) {
            expiredtime = new Date(limit_timeurl[0].expired_time)
        } else {
            expiredtime = new Date()
        }
        let currenttime = new Date()
        currenttime.setSeconds(currenttime.getSeconds() + 1)
        currenttime = currenttime.getTime()
        expiredtime = expiredtime.getTime()

        storesignurl = domainname + `file/` + limit_timeurl[0].case_id + `/` + fileid

        if (currenttime > expiredtime) {

            let keyword = '',
                url = '',
                getcount = limit_timeurl[0].getcount + 1;

            keyword = '2025-por-33labs'

            if (limit_timeurl[0].file_url.match('pdf')) {
                check_pdf = 1
            } else {
                check_pdf = 0
            }

            if (check_pdf == 0) {
                url = s3.getSignedUrl('getObject', {
                    Bucket: keyword,
                    Key: limit_timeurl[0].file_name.replace(/[^\p{L}\p{N}\s._\-()@+#&!=\/]/gu, '_'),
                    Expires: 60 * 60 * 24
                });
            } else {
                url = s3.getSignedUrl('getObject', {
                    Bucket: keyword,
                    ResponseContentDisposition: 'inline',
                    ResponseContentType: 'application/pdf',
                    Key: limit_timeurl[0].file_name.replace(/[^\p{L}\p{N}\s._\-()@+#&!=\/]/gu, '_'),
                    Expires: 60 * 60 * 24
                });
            }

            // update db expired url 
            let expired_time = new Date();
            expired_time.setDate(expired_time.getDate() + 1);
            
            const update_limit_timeurl_query = 'UPDATE file_upload_table SET limit_time_url = ?, expired_time = ?, getcount = ? where case_id = ? AND file_id = ?;';
            const update_details_values = [url, expired_time, getcount, caseid, fileid];
            const [update_result] = await pool.query(update_limit_timeurl_query, update_details_values);

            return url;
        } else {
            let getcount = limit_timeurl[0].getcount + 1;
            
            // Use async/await instead of callback
            const update_query = 'UPDATE file_upload_table SET getcount = ? WHERE case_id = ? AND file_id = ?';
            const update_values = [getcount, caseid, fileid];
            await pool.query(update_query, update_values);

            // Return the existing URL for redirection
            return limit_timeurl[0].limit_time_url;
        }
    }
}

module.exports = File;
