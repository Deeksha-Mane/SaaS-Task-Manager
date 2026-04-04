import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail', // or 'outlook', 'yahoo', etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // App password, not regular password
        }
    });
};

// Send task reminder email
export const sendTaskReminder = async (userEmail, userName, task) => {
    const transporter = createTransporter();
    
    if (!transporter) {
        console.log('📧 Email not configured, skipping email send');
        return { success: false, message: 'Email not configured' };
    }

    try {
        const dueInfo = task.dueDate 
            ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>`
            : '';

        const subtasksInfo = task.subtasks && task.subtasks.length > 0
            ? `
                <h3>Subtasks:</h3>
                <ul>
                    ${task.subtasks.map(st => `<li>${st.completed ? '✓' : '○'} ${st.text}</li>`).join('')}
                </ul>
            `
            : '';

        const notesInfo = task.notes
            ? `<p><strong>Notes:</strong><br>${task.notes.replace(/\n/g, '<br>')}</p>`
            : '';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `🔔 Task Reminder: ${task.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #6366f1; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .task-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 8px; }
                        .priority-high { background: #fee2e2; color: #991b1b; }
                        .priority-medium { background: #fef3c7; color: #92400e; }
                        .priority-low { background: #d1fae5; color: #065f46; }
                        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                        .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">📋 Task Reminder</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName},</p>
                            <p>This is a reminder for your task:</p>
                            
                            <div class="task-title">${task.title}</div>
                            
                            <div style="margin: 15px 0;">
                                <span class="badge priority-${task.priority}">
                                    ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
                                    ${task.priority.toUpperCase()}
                                </span>
                                ${task.tags && task.tags.length > 0 ? task.tags.map(tag => `<span class="badge" style="background: #e0e7ff; color: #3730a3;">${tag}</span>`).join('') : ''}
                            </div>
                            
                            ${task.description ? `<p><strong>Description:</strong><br>${task.description}</p>` : ''}
                            ${dueInfo}
                            ${notesInfo}
                            ${subtasksInfo}
                            
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="button">
                                View in Dashboard
                            </a>
                        </div>
                        <div class="footer">
                            <p>You're receiving this because you set a reminder for this task.</p>
                            <p>Task Manager App © ${new Date().getFullYear()}</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${userEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Test email configuration
export const testEmailConfig = async () => {
    const transporter = createTransporter();
    
    if (!transporter) {
        return { success: false, message: 'Email not configured' };
    }

    try {
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return { success: false, error: error.message };
    }
};
