const { ContactMessage } = require('../models');
const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Save to database
        await ContactMessage.create({ name, email, message });
        
        // TODO: Configure nodemailer for actual email sending
        // For now, just redirect with success message
        res.redirect('/contact?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting message');
    }
};


