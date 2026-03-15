const fs = require('fs');

/**
 * Schedule a file for deletion after a given number of minutes
 * @param {string} filePath - Absolute path to the file
 * @param {number} minutesUntilDelete - Minutes to wait before deletion (default 15)
 */
const scheduleCleanup = (filePath, minutesUntilDelete = 15) => {
    const msUntilDelete = minutesUntilDelete * 60 * 1000;
    
    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete expired file ${filePath}:`, err);
                } else {
                    console.log(`Successfully deleted expired file: ${filePath}`);
                }
            });
        }
    }, msUntilDelete);
};

module.exports = { scheduleCleanup };
