const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        // Generate unique filename and format path for web access
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
        // Add virtual path to request object for later use
        if (req.file) {
            req.file.path = '/uploads/' + filename;
        }
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and Webp images are allowed.'), false);
    }
};

// Initialize multer with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

module.exports  = upload
