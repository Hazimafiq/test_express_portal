const pool = require('../utils/mysql');
const randomstring = require("randomstring")
const CustomError = require('../errors/CustomError');
const { check } = require('prettier');
const STATUS = process.env.STATUS;


//get signedurl domain name
let domainname = ''
if (STATUS == 'production') {
    domainname = process.env.productionsignedurl
} else if (STATUS == 'local') {
    domainname = process.env.localsignedurl
} else {
    domainname = process.env.devsignedurl
}

class Case {
    static async new_case({ name, gender, dob, email, treatment_brand, custom_sn, category, status }, session) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        let case_id_value = generate();
        while(true){
            const [checking] = await pool.query(check_case_id, case_id_value);
            if (checking.length === 0) {
                break;
            }
            case_id_value = generate();
        }
        const Ipatient_table_query = 'INSERT INTO patient_table (case_id, name, gender, dob, email, treatment_brand, custom_sn, category, doctor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [case_id_value, name.trim(), gender, dob, email.trim(), treatment_brand, custom_sn, category, session.user.id, status];
        const [results] = await pool.query(Ipatient_table_query, values);
        return case_id_value;
    }

    static async edit_case(caseid, { name, gender, dob, email, treatment_brand, custom_sn }) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [exist_case_id] = await pool.query(check_case_id, caseid);
        if (exist_case_id.length < 1) {
            throw new CustomError('No this case id', 400);
        }
        const query = `UPDATE patient_table SET name = ?, gender = ?, dob = ?, email = ?, treatment_brand = ?, custom_sn = ?, updated_at = ? WHERE case_id = ?`;
        const values = [name.trim(), gender, dob, email.trim(), treatment_brand, custom_sn, new Date(), caseid];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async new_case_treatment(caseid, { crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type }) {
        const Ipatient_treatment_table_query = 'INSERT INTO treatment_model_table (case_id, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [caseid, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type];
        const [results] = await pool.query(Ipatient_treatment_table_query, values);
        return results;
    }

    static async edit_case_treatment(caseid, { crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type }) {
        const check_case_id = 'SELECT * FROM treatment_model_table WHERE case_id = ?';
        const [exist_case_id] = await pool.query(check_case_id, caseid);
        if (exist_case_id.length < 1) {
            throw new CustomError('No this case id', 400);
        }
        const query = 'UPDATE treatment_model_table SET crowding = ?, deep_bite = ?, spacing = ?, narrow_arch = ?, class_ii_div_1 = ?, class_ii_div_2 = ?, class_iii = ?, open_bite = ?, overjet = ?, anterior_crossbite = ?, posterior_crossbite = ?, others = ?, ipr = ?, attachments = ?, treatment_notes = ?, model_type = ?, updated_at = ? WHERE case_id = ?';
        const values = [crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type, new Date(), caseid];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async new_case_stl(caseid, { product, product_arrival_date, model_type }) {
        const Ipatient_treatment_table_query = 'INSERT INTO treatment_model_table (case_id, product, product_arrival_date, model_type) VALUES (?, ?, ?, ?)';
        const values = [caseid, product, product_arrival_date, model_type];
        const [results] = await pool.query(Ipatient_treatment_table_query, values);
        return results;
    }

    static async edit_case_stl(caseid, { product, product_arrival_date, model_type }) {
        const check_case_id = 'SELECT * FROM treatment_model_table WHERE case_id = ?';
        const [exist_case_id] = await pool.query(check_case_id, caseid);
        if (exist_case_id.length < 1) {
            throw new CustomError('No this case id', 400);
        }
        const query = 'UPDATE treatment_model_table SET product = ?, product_arrival_date = ?, model_type = ? WHERE case_id = ?';
        const values = [product, product_arrival_date, model_type, caseid];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async new_case_file_upload(caseid, session, files) {
        const getFileIdquery = 'SELECT * FROM file_upload_table WHERE case_id = ?';
        const [checking] = await pool.query(getFileIdquery, caseid);
        let query = '';
        let storesignurl = '';
        for (let i = 0; i < files.length; i++){
            storesignurl = domainname + `/` + caseid + `/` + (i+1)
            query += `INSERT INTO file_upload_table SET planner_id = ${session.user.id}, case_id = ${pool.escape(caseid)}, file_type = ${pool.escape(files[i].fieldname)}, file_name = ${pool.escape(files[i].key.split('.'[1]))}, file_originalname = ${pool.escape(files[i].originalname)}, file_url = ${pool.escape(files[i].location)}, signedurl = ${pool.escape(storesignurl)}, file_id = ${i+1};`
        }
        const [results] = await pool.query(query);
        return results;
    }

    //need to debug for stl upload part
    static async edit_case_file_upload(caseid, session, files) {
        let checkquery = '';
        let getfileIdquery = '';
        let query = '';
        let storesignurl = '';
        let latestfileid = '';
        let count = 1;
        for (let i = 0; i < files.length; i++){
            checkquery += `SELECT file_type FROM file_upload_table WHERE case_id = ${pool.escape(caseid)} AND file_type = ${pool.escape(files[i].fieldname)};`
        }
        const [check_result] = await pool.query(checkquery);
        getfileIdquery += `SELECT file_id FROM file_upload_table WHERE case_id = ${pool.escape(caseid)} ORDER BY id DESC LIMIT 1;`
        const [file_id_result] = await pool.query(getfileIdquery);
        latestfileid = file_id_result[0].file_id
        for (let i = 0; i < check_result.length; i++){
            if(check_result[i][0]){ // check file_type exists or not
                query += `UPDATE file_upload_table SET planner_id = ${session.user.id}, file_name = ${pool.escape(files[i].key.split('.'[1]))}, file_originalname = ${pool.escape(files[i].originalname)}, file_url = ${pool.escape(files[i].location)}, updated_at = ${pool.escape(new Date())} WHERE case_id = ${pool.escape(caseid)} AND file_type = ${pool.escape(files[i].fieldname)};`
            } else {
                storesignurl = domainname + `/` + caseid + `/` + (latestfileid + count)
                query += `INSERT INTO file_upload_table SET planner_id = ${session.user.id}, case_id = ${pool.escape(caseid)}, file_type = ${pool.escape(files[i].fieldname)}, file_name = ${pool.escape(files[i].key.split('.'[1]))}, file_originalname = ${pool.escape(files[i].originalname)}, file_url = ${pool.escape(files[i].location)}, signedurl = ${pool.escape(storesignurl)}, file_id = ${latestfileid + count};`
                count += 1
            }
        }
        const [results] = await pool.query(query);
        return results;
    }

    static async get_patient_details_data(caseid) {
        const query = 'SELECT case_id, name, gender, dob, email, treatment_brand, custom_sn FROM patient_table WHERE case_id = ? LIMIT 1';
        const values = [caseid];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No Patient Found', 401)
        }
        return results;
    }

    static async get_treatment_details_data(caseid) {
        const query = 'SELECT case_id, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes FROM patient_table WHERE case_id = ? LIMIT 1';
        const values = [caseid];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No Patient Treatment Found', 401)
        }
        return results;
    }

    static async get_model_data(caseid) {
        const query = 'SELECT case_id, file_type, file_name, file_url, signedurl FROM file_upload_table WHERE case_id = ? LIMIT 1';
        const values = [caseid];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No Patient Model Found', 401)
        }
        return results;
    }

    static async get_all_cases(filters = {}, session = {}) {
        const { treatment_brand, created_date, last_updated_date, search, sortBy = 'created_at', sortOrder = 'DESC', limit, offset } = filters;
        const { id, role } = session;

        let query = 'SELECT case_id, treatment_brand, name, category, created_at, updated_at, status FROM patient_table';
        let whereConditions = [];
        let queryParams = [];

        if (role=='doctor'){
            whereConditions.push('doctor_id = ?');
            queryParams.push(id);
        }
        // Add treatment brand filter
        if (treatment_brand && treatment_brand.trim() !== '') {
            whereConditions.push('treatment_brand = ?');
            queryParams.push(treatment_brand.trim());
        }
        
        // Add search filter (searches in case id, and name)
        if (created_date && created_date !== '') {
            whereConditions.push('created_at >= ?');
            queryParams.push(created_date);
        }
        
        // Add search filter (searches in case id, and name)
        if (last_updated_date && last_updated_date !== '') {
            whereConditions.push('updated_at <= ?');
            queryParams.push(last_updated_date);
        }
        
        // Add search filter (searches in case id, and name)
        if (search && search.trim() !== '') {
            whereConditions.push('(case_id LIKE ? OR name LIKE ?)');
            const searchPattern = `%${search.trim()}%`;
            queryParams.push(searchPattern, searchPattern);
        }
        
        // Add WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        // Add sorting
        const validSortColumns = ['created_at', 'last_updated'];
        const validSortOrders = ['ASC', 'DESC'];
        
        if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
            query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        } else {
            query += ' ORDER BY created_at DESC'; // Default sorting
        }
        
        // Add pagination
        if (limit && Number.isInteger(parseInt(limit)) && parseInt(limit) > 0) {
            query += ' LIMIT ?';
            queryParams.push(parseInt(limit));
            
            if (offset && Number.isInteger(parseInt(offset)) && parseInt(offset) >= 0) {
                query += ' OFFSET ?';
                queryParams.push(parseInt(offset));
            }
        }
        
        const [results] = await pool.query(query, queryParams);
        
        // Get total count for pagination (without limit/offset)
        let countQuery = 'SELECT COUNT(*) as total FROM patient_table';
        let countParams = [];
        
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
            // For count query, we only need the filter parameters, not limit/offset
            let paramCount = 0;
            if (treatment_brand && treatment_brand.trim() !== '') paramCount++;
            if (created_date && created_date !== '') paramCount++;
            if (last_updated_date && last_updated_date !== '') paramCount++;
            if (search && search.trim() !== '') paramCount += 2; // search uses 2 parameters
            
            countParams = queryParams.slice(0, paramCount);
        }
        
        const [countResults] = await pool.query(countQuery, countParams);
        const total = countResults[0].total;
        
        return {
            cases: results,
            total: total,
            count: results.length
        };
    }

    static async getCaseCounts(filters = {}, session = {}) {
        const { treatment_brand, created_date, last_updated_date, search } = filters;
        const { id, role } = session;
        
        let baseQuery = 'SELECT status, COUNT(*) as count FROM patient_table';
        let whereConditions = [];
        let queryParams = [];

        if (role=='doctor'){
            whereConditions.push('doctor_id = ?');
            queryParams.push(id);
        }
        // Add treatment brand filter
        if (treatment_brand && treatment_brand.trim() !== '') {
            whereConditions.push('treatment_brand = ?');
            queryParams.push(treatment_brand.trim());
        }
        
        // Add search filter (searches in case id, and name)
        if (created_date && created_date !== '') {
            whereConditions.push('created_at >= ?');
            queryParams.push(created_date);
        }
        
        // Add search filter (searches in case id, and name)
        if (last_updated_date && last_updated_date !== '') {
            whereConditions.push('updated_at <= ?');
            queryParams.push(last_updated_date);
        }
        
        // Add search filter (searches in case id, and name)
        if (search && search.trim() !== '') {
            whereConditions.push('(case_id LIKE ? OR name LIKE ?)');
            const searchPattern = `%${search.trim()}%`;
            queryParams.push(searchPattern, searchPattern);
        }
        
        // Add WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            baseQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        baseQuery += ' GROUP BY status';
        
        const [results] = await pool.query(baseQuery, queryParams);
        
        // Also get total count
        let totalQuery = 'SELECT COUNT(*) as total FROM patient_table';
        if (whereConditions.length > 0) {
            totalQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        const [totalResults] = await pool.query(totalQuery, queryParams);
        
        // Format the results
        const counts = {
            all: totalResults[0].total,
            submitted: 0,
            draft: 0
        };
        
        results.forEach(row => {
            counts[row.status] = row.count;
        });
        
        return counts;
    }

    static async edit(username, fullName, phoneNumber, email, country, role ) {
        const query = 'UPDATE users_table SET fullName = ?, phoneNumber = ?, email = ?, country = ?, role = ? WHERE username = ? LIMIT 1';
        const values = [fullName, phoneNumber, email, country, role, username];
        const [results] = await pool.query(query, values);
        return results;
    }
}

//generate case_id with format XXXX-YYY (X stand for alphabet, Y stand for digit)
function generate(n) {

    var alpha = randomstring.generate({
        length: 3,
        readable: true,
        capitalization: 'lowercase',
        charset: 'alphabetic'
    })

    var number = randomstring.generate({
        length: 4,
        charset: 'numeric'
    })

    return `${alpha}-${number}`
}

module.exports = Case;
