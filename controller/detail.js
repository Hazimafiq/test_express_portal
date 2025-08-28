const Detail = require('../model/Detail');
const Case = require('../model/Case');
const CustomError = require('../errors/CustomError');
const archiver = require('archiver');
const AWS = require('aws-sdk');
const https = require('https');

// Update comments in details page
exports.update_comment = async (req, res) => {
    try {
        const { comments } = req.body;

        const { caseid } = req.query  
        if ( !comments ) {
            return res.status(400).json({ message: 'Please leave comments before save.' });
        }
        const save_comment = await Detail.update_comment(caseid, comments, req.session.user);

        res.status(201).json({ message: 'Comment updated.' });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get comments in details page
exports.get_comment = async (req, res) => {
    try {
        const { caseid } = req.params  
        if ( !caseid ) {
            return res.status(400).json({ message: 'No caseid received.' });
        }
        const save_comment = await Detail.get_comment(caseid);

        res.status(201).json({ save_comment });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add simulation plan number in details page
exports.add_simulation_plan = async (req, res) => {
    try {
        // need name for ipr filename, simulation_number need to know which plan
        const { name, simulation_url } = req.body;
        const { caseid } = req.query
        if ( !caseid ) {
            return res.status(400).json({ message: 'No caseid received.' });
        }

        const files = req.files || [];    

        const filesByField = {};
        files.forEach(file => {
        if (!filesByField[file.fieldname]) {
                filesByField[file.fieldname] = [];
            }
            filesByField[file.fieldname].push(file);
        });

        const { ipr } = filesByField

        if (!simulation_url || !ipr) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const add_simulation_plan = await Detail.add_simulation_plan(caseid, simulation_url);
        const new_ipr = await Case.new_case_file_upload(caseid, req.session, req.files, add_simulation_plan);

        res.status(201).json({ message: 'Simulation plan added.' });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get simulation link and ipr file in details page
exports.get_simulation_plan = async (req, res) => {    
    try {
        // simulation_number need to know which plan
        const { caseid } = req.query

        const simulation_details = await Detail.get_simulation_plan(caseid);

        res.status(201).json({ simulation_details });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Approve simulation plan / Revoke simulation plan
exports.action_simulation_plan = async (req, res) => {    
    try {
        // simulation_number need to know which plan, action = 'Approved' or 'Revoke'
        const { caseid, simulation_number, action } = req.query

        const simulation_details = await Detail.action_simulation_plan(caseid, simulation_number, action);

        res.status(201).json({ message: `This simulation plan is ${action}.` });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
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