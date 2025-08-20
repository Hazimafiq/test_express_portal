const Case = require('../model/Case');
const CustomError = require('../errors/CustomError');

// Update case, if with case_id query, then means edit, else means new case, status code 0 = draft, status 1 = submitted
exports.update_case = async (req, res) => {
    try {
        const { name, gender, dob, email, treatment_brand, custom_sn, crowding, deep_bite, spacing, narrow_arch, class_ii_div_1, class_ii_div_2, class_iii, open_bite, overjet, anterior_crossbite, posterior_crossbite, others, ipr, attachments, treatment_notes, model_type, status } = req.body;
        const { caseid } = req.query
        const { lower_scan, upper_scan, bite_scan } = req.files
        // if (!name || !gender || !dob || !treatment_brand || !ipr || !attachments || !email || !model_type || !lower_scan || !upper_scan) {
        if (!name || !gender || !dob || !treatment_brand || !ipr || !attachments || !email || !model_type) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        console.log(req.body, req.files)
        if (!caseid){
            const new_case = await Case.new_case(req.body);
            // console.log('After new_case creation:', { new_case, body: req.body });
            const new_case_treatment = await Case.new_case_treatment(new_case, req.body)
            // const new_case_model = await Case.new_case_treatment(new_case, req.body. req.files)
            if(status == 0){
                res.status(201).json({ message: 'Case draft created successfully' });
            } else {                
                res.status(201).json({ message: 'Case created successfully' });
            }
        } else {
            const edit_case = await Case.edit_case(caseid, req.body)
            const edit_case_treatment = await Case.edit_case_treatment(caseid, req.body)
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

// Get one user details
exports.get_user_profile = async (req, res) => {
    try {
        const { id } = req.query;
        const user = await User.get_profile_data(id);
        res.status(200).json({ user });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { username } = req.session.user; // Assume middleware sets req.session.user
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        const message = await User.changePassword(username, oldPassword, newPassword);
        res.status(200).json({ message });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout user
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Logged out successfully' });
    });
};
