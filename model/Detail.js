const pool = require('../utils/mysql');
const randomstring = require("randomstring")
const CustomError = require('../errors/CustomError');
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

class Detail {
    static async update_comment(caseid, comment, user) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [checking] = await pool.query(check_case_id, caseid);
        if (checking.length === 0) {
            throw new CustomError('No this case id', 400);
        }
        const Icomment_query = 'INSERT INTO comments_table (case_id, name, comments, comment_user_id) VALUES (?, ?, ?, ?)';
        const values = [caseid, user.fullName.trim(), comment.trim(), user.id];
        const [results] = await pool.query(Icomment_query, values);
        return results;
    }

    static async get_comment(caseid) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [exist_case_id] = await pool.query(check_case_id, caseid);
        if (exist_case_id.length < 1) {
            throw new CustomError('No this case id', 400);
        }
        const query = `SELECT name, comments, updated_time FROM comments_table WHERE case_id = ?`;
        const values = [caseid];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async add_simulation_plan(caseid) {
        let simulation_number = 1;
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [case_checking] = await pool.query(check_case_id, caseid);
        if (case_checking.length === 0) {
            throw new CustomError('No this case id', 400);
        }
        const check_plan_id = 'SELECT * FROM simulation_data_table WHERE case_id = ?';
        const [plan_checking] = await pool.query(check_plan_id, caseid);
        if (plan_checking.length === 0) {
            const Isimulation_query = 'INSERT INTO simulation_data_table (case_id, simulation_number) VALUES (?, ?)';
            const values = [caseid, simulation_number];
            const [results] = await pool.query(Isimulation_query, values);
            return results;
        } else {
            simulation_number = plan_checking.length + 1;
            const Isimulation_query = 'INSERT INTO simulation_data_table (case_id, simulation_number) VALUES (?, ?)';
            const values = [caseid, simulation_number];
            const [results] = await pool.query(Isimulation_query, values);
            return results;
        }
    }

    static async update_simulation_plan(caseid, { simulation_url, simulation_number }) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [checking] = await pool.query(check_case_id, caseid);
        if (checking.length === 0) {
            throw new CustomError('No this case id', 400);
        }        
        const check_plan_id = 'SELECT simulation_url FROM simulation_data_table WHERE case_id = ? AND simulation_number = ?';
        const check_plan_values = [caseid, simulation_number];
        const [plan_checking] = await pool.query(check_plan_id, check_plan_values);
        if (plan_checking.length === 0) {
            throw new CustomError('No this simulation id', 400);
        }
        const Usimulation_query = 'UPDATE simulation_data_table SET simulation_url = ? WHERE case_id = ? AND simulation_number = ?';
        const values = [simulation_url, caseid, simulation_number];
        const [results] = await pool.query(Usimulation_query, values);
        return results;
    }

    static async get_simulation_plan(caseid , simulation_number ) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [checking] = await pool.query(check_case_id, caseid);
        if (checking.length === 0) {
            throw new CustomError('No this case id', 400);
        }

        const check_plan_id = 'SELECT simulation_data_table.simulation_url, simulation_data_table.created_time, file_upload_table.file_name, file_upload_table.file_originalname, file_upload_table.file_type, file_upload_table.signedurl FROM simulation_data_table JOIN file_upload_table ON simulation_data_table.case_id = file_upload_table.case_id WHERE simulation_data_table.case_id = ? AND simulation_data_table.simulation_number = ? AND file_upload_table.file_type = "ipr" LIMIT 1;';
        const check_plan_values = [caseid, simulation_number];
        const [plan_checking] = await pool.query(check_plan_id, check_plan_values);
        if (plan_checking.length === 0) {
            throw new CustomError('No this simulation id', 400);
        }
        return plan_checking;
    }

    static async action_simulation_plan(caseid, simulation_number, action ) {
        const check_case_id = 'SELECT * FROM patient_table WHERE case_id = ?';
        const [checking] = await pool.query(check_case_id, caseid);
        if (checking.length === 0) {
            throw new CustomError('No this case id', 400);
        }        
        const check_plan_id = 'SELECT simulation_url FROM simulation_data_table WHERE case_id = ? AND simulation_number = ?';
        const check_plan_values = [caseid, simulation_number];
        const [plan_checking] = await pool.query(check_plan_id, check_plan_values);
        if (plan_checking.length === 0) {
            throw new CustomError('No this simulation id', 400);
        }
        const Usimulation_query = 'UPDATE simulation_data_table SET decision = ? WHERE case_id = ? AND simulation_number = ?';
        const values = [action, caseid, simulation_number];
        const [results] = await pool.query(Usimulation_query, values);
        return results;
    }
}

module.exports = Detail;
