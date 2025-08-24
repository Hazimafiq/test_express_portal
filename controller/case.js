const Case = require('../model/Case');
const CustomError = require('../errors/CustomError');

// Update case, if with case_id query, then means edit, else means new case, status code 0 = draft, status 1 = submitted, category = New Case, Upload STL
exports.update_case = async (req, res) => {
    try {
        const { name, gender, dob, email, treatment_brand, custom_sn, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type, status, category } = req.body;

        const { caseid } = req.params

        const files = req.files || [];    

        const filesByField = {};
        files.forEach(file => {
        if (!filesByField[file.fieldname]) {
                filesByField[file.fieldname] = [];
            }
            filesByField[file.fieldname].push(file);
        });
        const { lower_scan, upper_scan, bite_scan, front, smiling, right_side, buccal_top, buccal_bottom, buccal_right, buccal_center, buccal_left, xray, other } = filesByField
        if (!name || !gender || !dob || !treatment_brand || !ipr || !attachments || !model_type || !lower_scan || !upper_scan) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!caseid){
            const new_case = await Case.new_case(req.body, req.session);
            const new_case_treatment = await Case.new_case_treatment(new_case, req.body);
            const new_case_file = await Case.new_case_file_upload(new_case, req.session, req.files);
            if(status == 0){
                res.status(201).json({ message: 'Case draft created successfully' });
            } else {                
                res.status(201).json({ message: 'Case created successfully' });
            }
        } else {
            const edit_case = await Case.edit_case(caseid, req.body)
            const edit_case_treatment = await Case.edit_case_treatment(caseid, req.body)
            const edit_case_file = await Case.edit_case_file_upload(caseid, req.session, req.files);
            if(status == 0){
                res.status(201).json({ message: 'Case draft updated successfully' });
            } else {                
                res.status(201).json({ message: 'Case updated successfully' });
            }
        }
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update case, if with case_id query, then means edit, else means new case, status code 0 = draft, status 1 = submitted
exports.update_stl_case = async (req, res) => {
    try {
        const { name, gender, dob, email, treatment_brand, custom_sn, product, product_arrival_date, model_type, status, category } = req.body;
        const { caseid } = req.query
        const { documents } = req.files
        if (!name || !treatment_brand || !dob || !product || !product_arrival_date || !model_type || documents) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!caseid){
            const new_case = await Case.new_case(req.body, req.session);
            const new_case_stl_treatment = await Case.new_case_stl(new_case, req.body);
            const new_case_file = await Case.new_case_file_upload(new_case, req.session, req.files);
            if(status == 0){
                res.status(201).json({ message: 'Case draft created successfully' });
            } else {                
                res.status(201).json({ message: 'Case created successfully' });
            }
        } else {
            const edit_case = await Case.edit_case(caseid, req.body)
            const edit_case_stl_treatment = await Case.edit_case_stl(caseid, req.body)
            const edit_case_file = await Case.edit_case_file_upload(caseid, req.session, req.files);
            if(status == 0){
                res.status(201).json({ message: 'Case draft updated successfully' });
            } else {                
                res.status(201).json({ message: 'Case updated successfully' });
            }
        }
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get patient details data
exports.get_patient_details_data = async (req, res) => {
    try {
        const { caseid } = req.query;
        const patient_details = await Case.get_patient_details_data(caseid);
        res.status(200).json({ patient_details });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Get patient treatment details data
exports.get_patient_treatment_details_data = async (req, res) => {
    try {
        const { caseid } = req.query;
        const patient_treatment_details = await Case.get_patient_treatment_details_data(caseid);
        res.status(200).json({ patient_treatment_details });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Get all cases with filtering, searching, and sorting
exports.getAllCases = async (req, res) => {
    try {
        const filters = {
            treatment_brand: req.query.treatment_brand,
            created_date: req.query.created_date,
            last_updated_date: req.query.last_updated_date,
            search: req.query.search,
            sortBy: req.query.sortBy || 'created_at',
            sortOrder: req.query.sortOrder || 'DESC',
            limit: req.query.limit,
            offset: req.query.offset
        };
        
        const result = await Case.get_all_cases(filters, req.session.user);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user counts by status
exports.getCaseCounts = async (req, res) => {
    try {
        const filters = {
            treatment_brand: req.query.treatment_brand,
            created_date: req.query.created_date,
            last_updated_date: req.query.last_updated_date,
            search: req.query.search
        };
        
        const counts = await Case.getCaseCounts(filters, req.session.user);
        res.status(200).json(counts);
    } catch (err) {
        console.error('Error fetching user counts:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};