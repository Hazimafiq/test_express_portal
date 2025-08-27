const File = require('../model/File');
const CustomError = require('../errors/CustomError');

// Get file with signedurl, get url: /file/:caseid/:fileid
exports.get_file_with_signedurl = async (req, res) => {
    try {
        const { caseid, fileid } = req.params;
        if (isNaN(fileid)) {
            return res.status(400).json({ message: 'Wrong file URL. Please select correctly.'})
        }
        const file_result = await File.get_file(req.params);
        res.redirect(file_result);
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}