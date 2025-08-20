const pool = require('../utils/mysql');
const randomstring = require("randomstring")
const CustomError = require('../errors/CustomError');

class Case {
    static async new_case({ name, gender, dob, email, treatment_brand, custom_sn }) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        let case_id_value = generate();
        while(true){
            const [checking] = await pool.query(check_case_id, case_id_value);
            if (checking.length === 0) {
                break;
            }
            case_id_value = generate();
        }
        const Ipatient_table_query = 'INSERT INTO patient_table (case_id, name, gender, dob, email, treatment_brand, custom_sn) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [case_id_value, name.trim(), gender, dob, email.trim(), treatment_brand, custom_sn];
        const [results] = await pool.query(Ipatient_table_query, values);
        return case_id_value;
    }

    static async edit_case(caseid, { name, gender, dob, email, treatment_brand, custom_sn }) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [exist_case_id] = await pool.query(check_case_id, caseid);
        if (exist_case_id.length < 1) {
            throw new CustomError('No this case id', 400);
        }
        const query = `UPDATE patient_table SET name = ?, gender = ?, dob = ?, email = ?, treatment_brand = ?, custom_sn = ? WHERE case_id = ?`;
        const values = [name.trim(), gender, dob, email.trim(), treatment_brand, custom_sn, caseid];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async new_case_treatment(caseid, { crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type }) {
        console.log(caseid, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes)
        const Ipatient_treatment_table_query = 'INSERT INTO treatment_model_table (case_id, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [caseid, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type];
        const [results] = await pool.query(Ipatient_treatment_table_query, values);
        return results;
    }

    static async edit_case_treatment(caseid, { crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes }) {
        const check_case_id = 'SELECT * FROM treatment_model_table WHERE case_id = ?';
        const [exist_case_id] = await pool.query(check_case_id, caseid);
        if (exist_case_id.length < 1) {
            throw new CustomError('No this case id', 400);
        }
        const query = 'UPDATE treatment_model_table SET crowding = ?, deep_bite = ?, spacing = ?, narrow_arch = ?, class_ii_div_1 = ?, class_ii_div_2 = ?, class_iii = ?, open_bite = ?, overjet = ?, anterior_crossbite = ?, posterior_crossbite = ?, others = ?, ipr = ?, attachments = ?, treatment_notes = ? WHERE case_id = ?';
        const values = [crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, caseid];
        const [results] = await pool.query(query, values);
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
