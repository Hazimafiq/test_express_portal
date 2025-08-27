const Case = require('../model/Case');
const CustomError = require('../errors/CustomError');
const archiver = require('archiver');
const AWS = require('aws-sdk');
const https = require('https');

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
        // If called as HTTP endpoint, get caseid from query
        // If called directly, treat req as the caseId
        const caseid = typeof req === 'object' && req.query ? req.query.caseid : req;
        
        const patient_details = await Case.get_patient_details_data(caseid);
        
        // If res is provided, it's an HTTP request
        if (res) {
            res.status(200).json({ patient_details });
        } else {
            // If no res, return the data directly
            return patient_details;
        }
    } catch (err) {
        if (res) {
            // HTTP request error handling
            if (err instanceof CustomError) {
                return res.status(err.statusCode).json({ message: err.message });
            } else {
                console.error(err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        } else {
            // Direct call error handling - rethrow the error
            throw err;
        }
    }
};

// Get patient treatment details data
exports.get_patient_treatment_details_data = async (req, res) => {
    try {
        const { caseid } = req.query;
        const patient_treatment_details = await Case.get_treatment_details_data(caseid);
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

// Get patient treatment details data
exports.get_patient_model_data = async (req, res) => {
    try {
        const { caseid } = req.query;
        const patient_model_details = await Case.get_model_data(caseid);
        res.status(200).json({ patient_model_details });
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
            status: req.query.status,
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

// Download all model files for a case
exports.downloadModelFiles = async (req, res) => {
    try {
        const { caseid } = req.params;
        
        // Get patient model data
        const patient_model_details = await Case.get_model_data(caseid);
        const { results } = patient_model_details;
        
        // Filter model files (upper_scan, lower_scan, bite_scan)
        const modelFiles = results.filter(file => 
            ['upper_scan', 'lower_scan', 'bite_scan'].includes(file.file_type)
        );
        
        if (modelFiles.length === 0) {
            return res.status(404).json({ message: 'No model files found' });
        }
        
        // Set response headers for zip download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="model_files_${caseid}.zip"`);
        
        // Create archive
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        
        // Handle archive errors
        archive.on('error', (err) => {
            throw err;
        });
        
        // Pipe archive to response
        archive.pipe(res);
        
        // Download each file and add to archive
        for (const file of modelFiles) {
            try {
                // Get the signed URL for the file
                const signedUrl = await getSignedUrlForFile(file);
                
                // Download file content and add to archive
                await new Promise((resolve, reject) => {
                    https.get(signedUrl, (fileRes) => {
                        if (fileRes.statusCode !== 200) {
                            reject(new Error(`Failed to download file: ${file.file_name}`));
                            return;
                        }
                        
                        archive.append(fileRes, { name: file.file_originalname || file.file_name });
                        fileRes.on('end', resolve);
                        fileRes.on('error', reject);
                    }).on('error', reject);
                });
            } catch (error) {
                console.error(`Error downloading file ${file.file_name}:`, error);
                // Continue with other files even if one fails
            }
        }
        
        // Finalize archive
        archive.finalize();
        
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error('Error downloading model files:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Download all clinical photos for a case
exports.downloadClinicalPhotos = async (req, res) => {
    try {
        const { caseid } = req.params;
        
        // Get patient model data
        const patient_model_details = await Case.get_model_data(caseid);
        const { results } = patient_model_details;
        
        // Filter clinical photo files
        const photoFiles = results.filter(file => 
            ['front', 'smiling', 'right_side', 'buccal_right', 'buccal_center', 'buccal_left', 'buccal_top', 'buccal_bottom'].includes(file.file_type)
        );
        
        if (photoFiles.length === 0) {
            return res.status(404).json({ message: 'No clinical photos found' });
        }
        
        // Set response headers for zip download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="clinical_photos_${caseid}.zip"`);
        
        // Create archive
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        
        // Handle archive errors
        archive.on('error', (err) => {
            throw err;
        });
        
        // Pipe archive to response
        archive.pipe(res);
        
        // Download each file and add to archive
        for (const file of photoFiles) {
            try {
                // Get the signed URL for the file
                const signedUrl = await getSignedUrlForFile(file);
                
                // Download file content and add to archive
                await new Promise((resolve, reject) => {
                    https.get(signedUrl, (fileRes) => {
                        if (fileRes.statusCode !== 200) {
                            reject(new Error(`Failed to download file: ${file.file_name}`));
                            return;
                        }
                        
                        archive.append(fileRes, { name: file.file_originalname || file.file_name });
                        fileRes.on('end', resolve);
                        fileRes.on('error', reject);
                    }).on('error', reject);
                });
            } catch (error) {
                console.error(`Error downloading file ${file.file_name}:`, error);
                // Continue with other files even if one fails
            }
        }
        
        // Finalize archive
        archive.finalize();
        
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error('Error downloading clinical photos:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Download individual file
exports.downloadIndividualFile = async (req, res) => {
    try {
        const { caseid, filetype } = req.params;
        
        // Get patient model data
        const patient_model_details = await Case.get_model_data(caseid);
        const { results } = patient_model_details;
        
        // Find the specific file by type
        const file = results.find(f => f.file_type === filetype);
        
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        
        // Get the signed URL for the file
        const signedUrl = await getSignedUrlForFile(file);
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${file.file_originalname || file.file_name}"`);
        
        // Redirect to the signed URL for download
        res.redirect(signedUrl);
        
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error('Error downloading individual file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper function to get signed URL for a file
async function getSignedUrlForFile(file) {
    const AWS = require('aws-sdk');
    
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });
    
    const bucketName = '2025-por-33labs'; // Same as in File.js
    
    // Generate signed URL for the file
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: file.file_name.replace(/[^\p{L}\p{N}\s._\-()@+#&!=\/]/gu, '_'),
        Expires: 60 * 60 // 1 hour
    });
    
    return signedUrl;
}