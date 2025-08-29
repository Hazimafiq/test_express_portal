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

    static async new_case_file_upload(caseid, session, files, simulation_number) {
        let query = '',
            storesignurl = '',
            simulationnumber = 0;
        if (simulation_number !== null && simulation_number !== undefined) {
            simulationnumber = simulation_number;
        } else {
            simulationnumber = 1;
        }
        const getFileIdquery = 'SELECT * FROM file_upload_table WHERE case_id = ?';
        const [checking] = await pool.query(getFileIdquery, caseid);        
        if (checking.length === 0) {
            for (let i = 0; i < files.length; i++){
                storesignurl = domainname + caseid + `/` + (i+1)
                query += `INSERT INTO file_upload_table SET planner_id = ${session.user.id}, case_id = ${pool.escape(caseid)}, file_type = ${pool.escape(files[i].fieldname)}, file_name = ${pool.escape(files[i].key.split('.'[1]))}, file_originalname = ${pool.escape(files[i].originalname)}, file_url = ${pool.escape(files[i].location)}, signedurl = ${pool.escape(storesignurl)}, file_id = ${i+1}, simulation_number = ${simulationnumber};`
            }
        } else {            
            for (let i = 0; i < files.length; i++){
                storesignurl = domainname + caseid + `/` + (i+1)
                query += `INSERT INTO file_upload_table SET planner_id = ${session.user.id}, case_id = ${pool.escape(caseid)}, file_type = ${pool.escape(files[i].fieldname)}, file_name = ${pool.escape(files[i].key.split('.'[1]))}, file_originalname = ${pool.escape(files[i].originalname)}, file_url = ${pool.escape(files[i].location)}, signedurl = ${pool.escape(storesignurl)}, file_id = ${checking.length + i + 1}, simulation_number = ${simulationnumber};`
            }
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
                storesignurl = domainname + caseid + `/` + (latestfileid + count)
                query += `INSERT INTO file_upload_table SET planner_id = ${session.user.id}, case_id = ${pool.escape(caseid)}, file_type = ${pool.escape(files[i].fieldname)}, file_name = ${pool.escape(files[i].key.split('.'[1]))}, file_originalname = ${pool.escape(files[i].originalname)}, file_url = ${pool.escape(files[i].location)}, signedurl = ${pool.escape(storesignurl)}, file_id = ${latestfileid + count};`
                count += 1
            }
        }
        const [results] = await pool.query(query);
        return results;
    }

    // Enhanced file upload method that handles file flags (new/existing/remove)
    static async edit_case_file_upload_with_flags(caseid, session, files, fileFlags = {}) {
        //console.log('File flags received:', fileFlags);
        
        for (const [fileType, flag] of Object.entries(fileFlags)) {
            if (flag === 'remove') {
                const deleteQuery = 'DELETE FROM file_upload_table WHERE case_id = ? AND file_type = ?';
                await pool.query(deleteQuery, [caseid, fileType]);
                //console.log(`Removed file type: ${fileType} for case: ${caseid}`);
            }
        }

        if (!files || files.length === 0) {
            return { message: 'No files to process' };
        }

        // Get latest file ID for new files
        const getFileIdQuery = 'SELECT file_id FROM file_upload_table WHERE case_id = ? ORDER BY id DESC LIMIT 1';
        const [fileIdResult] = await pool.query(getFileIdQuery, [caseid]);
        let latestFileId = fileIdResult.length > 0 ? fileIdResult[0].file_id : 0;

        let queries = [];
        let count = 1;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file.fieldname;
            const flag = fileFlags[fileType];

            //console.log(`Processing file: ${file.originalname}, type: ${fileType}, flag: ${flag}`);

            if (flag === 'new' || !flag) {
                // Check if file already exists
                const checkQuery = 'SELECT id FROM file_upload_table WHERE case_id = ? AND file_type = ?';
                const [existingFile] = await pool.query(checkQuery, [caseid, fileType]);
                //console.log('existingFile', existingFile[0].id)
                //console.log('fileType', fileType)
                //console.log('file', file)

                if (existingFile.length > 0) {
                    // Update existing file - also reset limit_time_url and expired_time for new signed URL generation
                    const updateQuery = `UPDATE file_upload_table SET 
                        planner_id = ?, 
                        file_name = ?, 
                        file_originalname = ?, 
                        file_url = ?, 
                        updated_at = ?,
                        limit_time_url = NULL,
                        expired_time = NULL
                        WHERE case_id = ? AND file_type = ?`;
                    
                    await pool.query(updateQuery, [
                            session.user.id,
                            file.key.split('.')[0], 
                            file.originalname,
                            file.location,
                            new Date(),
                            caseid,
                            fileType
                    ]);
                    //console.log(`Updated existing file: ${fileType} - reset limit_time_url and expired_time`);
                } else {
                    //console.log('insert new file')
                    // Insert new file
                    const storeSignUrl = domainname + caseid + `/` + (latestFileId + count);
                    const insertQuery = `INSERT INTO file_upload_table SET 
                        planner_id = ?, 
                        case_id = ?, 
                        file_type = ?, 
                        file_name = ?, 
                        file_originalname = ?, 
                        file_url = ?, 
                        signedurl = ?, 
                        file_id = ?`;
                    
                    await pool.query(insertQuery, [
                            session.user.id,
                            caseid,
                            fileType,
                            file.key.split('.')[0],
                            file.originalname,
                            file.location,
                            storeSignUrl,
                            latestFileId + count
                    ]);
                    //console.log(`Inserted new file: ${fileType}`);
                    count++;
                }
            }
        }

        // Execute all queries
        for (const queryObj of queries) {
            await pool.query(queryObj.query, queryObj.params);
        }

        return { message: 'File operations completed successfully' };
    }

    static async edit_upload_stl_file_upload_with_flags(caseid, session, files, fileFlags = {}) {
        //console.log('File flags received:', fileFlags);
        
        // First, handle file removals
        for (const [id, flag] of Object.entries(fileFlags)) {
            if (flag === 'remove') {
                const deleteQuery = 'DELETE FROM file_upload_table WHERE id = ? AND case_id = ?';
                await pool.query(deleteQuery, [id, caseid]);
                //console.log(`Removed file id: ${id} for case: ${caseid}`);
            }
        }

        if (!files || files.length === 0) {
            return { message: 'No files to process' };
        }

        // Get latest file ID for new files
        const getFileIdQuery = 'SELECT file_id FROM file_upload_table WHERE case_id = ? ORDER BY id DESC LIMIT 1';
        const [fileIdResult] = await pool.query(getFileIdQuery, [caseid]);
        let latestFileId = fileIdResult.length > 0 ? fileIdResult[0].file_id : 0;

        let queries = [];
        let count = 1;

        for (const file of files) {
            const fileType = file.fieldname;
            const flag = fileFlags[fileType] || 'new'; // Default to 'new' if no flag specified
            
            //console.log(`Processing file: ${file.originalname}, type: ${fileType}, flag: ${flag}`);
            
            if (flag === 'new') {
                //console.log('insert new file')
                // Insert new file
                const storeSignUrl = domainname + caseid + `/` + (latestFileId + count);
                const insertQuery = `INSERT INTO file_upload_table SET 
                    planner_id = ?, 
                    case_id = ?, 
                    file_type = ?, 
                    file_name = ?, 
                    file_originalname = ?, 
                    file_url = ?, 
                    signedurl = ?, 
                    file_id = ?`;
                
                await pool.query(insertQuery, [
                        session.user.id,
                        caseid,
                        fileType,
                        file.key.split('.')[0],
                        file.originalname,
                        file.location,
                        storeSignUrl,
                        latestFileId + count
                ]);
                //console.log(`Inserted new file: ${fileType}`);
            } else if (flag === 'existing') {
                    // Update existing file - also reset limit_time_url and expired_time for new signed URL generation
                    const updateQuery = `UPDATE file_upload_table SET 
                        planner_id = ?, 
                        file_name = ?, 
                        file_originalname = ?, 
                        file_url = ?, 
                        updated_at = ?,
                        limit_time_url = NULL,
                        expired_time = NULL
                        WHERE case_id = ? AND file_type = ?`;
                    
                    await pool.query(updateQuery, [
                            session.user.id,
                            file.key.split('.')[0], 
                            file.originalname,
                            file.location,
                            new Date(),
                            caseid,
                            fileType
                    ]);
                    //console.log(`Updated existing file: ${fileType} - reset limit_time_url and expired_time`);
             }
        }
       

        return { message: 'File operations completed successfully' };
    }

    // Helper method to validate if required scan files exist based on flags
    static async validateRequiredFiles(caseid, fileFlags = {}) {
        const requiredFileTypes = ['upper_scan', 'lower_scan'];
        const validationResults = {};

        for (const fileType of requiredFileTypes) {
            const flag = fileFlags[fileType];
            
            if (flag === 'remove') {
                // File is being removed, so it's invalid
                validationResults[fileType] = false;
            } else if (flag === 'new') {
                // New file being uploaded, so it's valid
                validationResults[fileType] = true;
            } else if (flag === 'existing') {
                // File should already exist in database
                const checkQuery = 'SELECT id FROM file_upload_table WHERE case_id = ? AND file_type = ?';
                const [result] = await pool.query(checkQuery, [caseid, fileType]);
                validationResults[fileType] = result.length > 0;
            } else {
                // No flag provided, check if file exists in database
                const checkQuery = 'SELECT id FROM file_upload_table WHERE case_id = ? AND file_type = ?';
                const [result] = await pool.query(checkQuery, [caseid, fileType]);
                validationResults[fileType] = result.length > 0;
            }
        }

        return validationResults;
    }

    static async get_patient_details_data(caseid) {
        const query = 'SELECT id, case_id, name, gender, dob, email, treatment_brand, custom_sn, category, status, updated_at FROM patient_table WHERE case_id = ? LIMIT 1';
        const values = [caseid];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No Patient Found', 401)
        }
        return results;
    }

    static async get_treatment_details_data(caseid) {
        const query = 'SELECT patient_table.case_id, treatment_model_table.crowding, treatment_model_table.deep_bite, treatment_model_table.spacing, treatment_model_table.narrow_arch, treatment_model_table.class_ii_div_1, treatment_model_table.class_ii_div_2, treatment_model_table.class_iii, treatment_model_table.open_bite, treatment_model_table.overjet, treatment_model_table.anterior_crossbite, treatment_model_table.posterior_crossbite, treatment_model_table.others, treatment_model_table.ipr, treatment_model_table.attachments, treatment_model_table.treatment_notes FROM patient_table JOIN treatment_model_table ON patient_table.case_id = treatment_model_table.case_id WHERE patient_table.case_id = ? LIMIT 1';
        const values = [caseid];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No Patient Treatment Found', 401)
        }
        return results;
    }

    static async get_model_data(caseid) {
        const query = 'SELECT case_id, file_type, file_name, signedurl FROM file_upload_table WHERE case_id = ?';
        const values = [caseid];
        const [results] = await pool.query(query, values);
        //get model type from treatment_model_table
        const model_type_query = 'SELECT model_type, product, product_arrival_date FROM treatment_model_table WHERE case_id = ?';
        const [model_type_result] = await pool.query(model_type_query, values);
        const model_type = model_type_result[0].model_type;
        const product = model_type_result[0].product;
        const product_arrival_date = model_type_result[0].product_arrival_date;
        
        if(results.length == 0){
            throw new CustomError('No Patient Model Found', 401)
        }
        return {results, model_type, product, product_arrival_date};
    }

    static async get_normal_case_data(caseid) {
        let returndata = [];
        const query = 'SELECT patient_table.id, patient_table.case_id, patient_table.name, patient_table.gender, patient_table.dob, patient_table.email, patient_table.treatment_brand, patient_table.custom_sn, patient_table.category, patient_table.status, patient_table.updated_at, treatment_model_table.crowding, treatment_model_table.deep_bite, treatment_model_table.spacing, treatment_model_table.narrow_arch, treatment_model_table.class_ii_div_1, treatment_model_table.class_ii_div_2, treatment_model_table.class_iii, treatment_model_table.open_bite, treatment_model_table.overjet, treatment_model_table.anterior_crossbite, treatment_model_table.posterior_crossbite, treatment_model_table.others, treatment_model_table.ipr, treatment_model_table.attachments, treatment_model_table.treatment_notes, treatment_model_table.model_type FROM patient_table JOIN treatment_model_table ON patient_table.case_id = treatment_model_table.case_id WHERE patient_table.case_id = ? LIMIT 1';
        const value = [caseid];
        const [data_result] = await pool.query(query, value);
        if(data_result.length == 0){
            throw new CustomError('No Patient Found', 401)
        }
        const file_query = 'SELECT file_type, file_name, signedurl FROM file_upload_table WHERE case_id = ?';
        const file_value = [caseid];
        const [file_results] = await pool.query(file_query, file_value);
        if(file_results.length == 0){
            throw new CustomError('No Patient Model Found', 401)
        }
        returndata.push(data_result)
        returndata.push(file_results)
        return returndata;
    }

    static async get_upload_stl_data(caseid) {
        let returndata = [];
        const basic_query = 'SELECT patient_table.id, patient_table.case_id, patient_table.name, patient_table.gender, patient_table.dob, patient_table.email, patient_table.treatment_brand, patient_table.custom_sn, patient_table.category, patient_table.status, patient_table.updated_at, treatment_model_table.product, treatment_model_table.product_arrival_date, treatment_model_table.model_type FROM patient_table JOIN treatment_model_table ON patient_table.case_id = treatment_model_table.case_id WHERE patient_table.case_id = ? LIMIT 1';
        const basic_values = [caseid];
        const [data_result] = await pool.query(basic_query, basic_values);
        if(data_result.length == 0){
            throw new CustomError('No Patient Found', 401)
        }
        const file_query = 'SELECT id, file_type, file_name, signedurl FROM file_upload_table WHERE case_id = ?';
        const file_value = [caseid];
        const [file_results] = await pool.query(file_query, file_value);
        if(file_results.length == 0){
            throw new CustomError('No Patient Model Found', 401)
        }
        returndata.push(data_result)
        returndata.push(file_results)
        return returndata;
    }

    static async get_all_cases(filters = {}, session = {}) {
        const { treatment_brand, created_date, last_updated_date, status, search, sortBy = 'created_at', sortOrder = 'DESC', limit, offset } = filters;
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

        // Add status filter
        if (status && status.trim() !== '' && status !== 'all') {
            whereConditions.push('status = ?');
            queryParams.push(status.trim());
        }
        
        // Add created date filter (handles date ranges in format "from|to")
        if (created_date && created_date !== '') {
            const dates = created_date.split('|');
            if (dates.length === 2) {
                const [fromDate, toDate] = dates;
                if (fromDate && fromDate.trim() !== '') {
                    whereConditions.push('DATE(created_at) >= ?');
                    queryParams.push(fromDate.trim());
                }
                if (toDate && toDate.trim() !== '') {
                    whereConditions.push('DATE(created_at) <= ?');
                    queryParams.push(toDate.trim());
                }
            } else {
                // Single date case
                whereConditions.push('DATE(created_at) = ?');
                queryParams.push(created_date);
            }
        }
        
        // Add last updated date filter (handles date ranges in format "from|to")
        if (last_updated_date && last_updated_date !== '') {
            const dates = last_updated_date.split('|');
            if (dates.length === 2) {
                const [fromDate, toDate] = dates;
                if (fromDate && fromDate.trim() !== '') {
                    whereConditions.push('DATE(updated_at) >= ?');
                    queryParams.push(fromDate.trim());
                }
                if (toDate && toDate.trim() !== '') {
                    whereConditions.push('DATE(updated_at) <= ?');
                    queryParams.push(toDate.trim());
                }
            } else {
                // Single date case
                whereConditions.push('DATE(updated_at) = ?');
                queryParams.push(last_updated_date);
            }
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
        const validSortColumns = ['created_at', 'updated_at'];
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
            
            // Count parameters for each filter to match the exact parameter count
            if (role=='doctor') paramCount++;
            if (treatment_brand && treatment_brand.trim() !== '') paramCount++;
            if (status && status.trim() !== '' && status !== 'all') paramCount++;
            
            // Count created_date parameters
            if (created_date && created_date !== '') {
                const dates = created_date.split('|');
                if (dates.length === 2) {
                    const [fromDate, toDate] = dates;
                    if (fromDate && fromDate.trim() !== '') paramCount++;
                    if (toDate && toDate.trim() !== '') paramCount++;
                } else {
                    paramCount++;
                }
            }
            
            // Count last_updated_date parameters
            if (last_updated_date && last_updated_date !== '') {
                const dates = last_updated_date.split('|');
                if (dates.length === 2) {
                    const [fromDate, toDate] = dates;
                    if (fromDate && fromDate.trim() !== '') paramCount++;
                    if (toDate && toDate.trim() !== '') paramCount++;
                } else {
                    paramCount++;
                }
            }
            
            if (search && search.trim() !== '') paramCount += 2;
            
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
        
        // Add created date filter (handles date ranges in format "from|to")
        if (created_date && created_date !== '') {
            const dates = created_date.split('|');
            if (dates.length === 2) {
                const [fromDate, toDate] = dates;
                if (fromDate && fromDate.trim() !== '') {
                    whereConditions.push('DATE(created_at) >= ?');
                    queryParams.push(fromDate.trim());
                }
                if (toDate && toDate.trim() !== '') {
                    whereConditions.push('DATE(created_at) <= ?');
                    queryParams.push(toDate.trim());
                }
            } else {
                // Single date case
                whereConditions.push('DATE(created_at) = ?');
                queryParams.push(created_date);
            }
        }
        
        // Add last updated date filter (handles date ranges in format "from|to")
        if (last_updated_date && last_updated_date !== '') {
            const dates = last_updated_date.split('|');
            if (dates.length === 2) {
                const [fromDate, toDate] = dates;
                if (fromDate && fromDate.trim() !== '') {
                    whereConditions.push('DATE(updated_at) >= ?');
                    queryParams.push(fromDate.trim());
                }
                if (toDate && toDate.trim() !== '') {
                    whereConditions.push('DATE(updated_at) <= ?');
                    queryParams.push(toDate.trim());
                }
            } else {
                // Single date case
                whereConditions.push('DATE(updated_at) = ?');
                queryParams.push(last_updated_date);
            }
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

    static async updateCasetoDraft(caseId) {
        const query = 'UPDATE patient_table SET status = "0", updated_at = CURRENT_TIMESTAMP WHERE case_id = ?';
        const values = [caseId];
        const [results] = await pool.query(query, values);
        if (results.affectedRows === 0) {
            throw new CustomError('Case not found', 404);
        }
        return results;
    }

    static async deleteCase(caseId) {
        const query = 'UPDATE patient_table SET status = "-1", updated_at = CURRENT_TIMESTAMP WHERE case_id = ?';
        const values = [caseId];
        const [results] = await pool.query(query, values);
        if (results.affectedRows === 0) {
            throw new CustomError('Case not found', 404);
        }
        return results;
    }

    static async updateCaseStatus(caseId, status) {
        const query = 'UPDATE patient_table SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE case_id = ?';
        const values = [status, caseId];
        const [results] = await pool.query(query, values);
        if (results.affectedRows === 0) {
            throw new CustomError('Case not found', 404);
        }
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
